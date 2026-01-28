package com.jossendal.essentialgooglesignin

import android.util.Log
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.gms.common.GoogleApiAvailability
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.security.MessageDigest
import java.util.Collections
import java.util.UUID

class EssentialGoogleSigninModule : Module() {

  private val context
    get() = requireNotNull(appContext.currentActivity) {
      "Activity is not available"
    }
  
  private val activity
    get() = requireNotNull(appContext.activityProvider?.currentActivity) {
      "Activity provider is not available"
    }

  private lateinit var credentialManager: CredentialManager
  private var webClientId: String? = null
  private var androidClientId: String? = null
  private var tokenVerifier: GoogleIdTokenVerifier? = null

  override fun definition() = ModuleDefinition {

    OnCreate {
      credentialManager = CredentialManager.create(activity)
    }

    Name("EssentialGoogleSignin")

    AsyncFunction("hasPlayServices") {
      return@AsyncFunction GoogleApiAvailability.getInstance()
        .isGooglePlayServicesAvailable(context) == com.google.android.gms.common.ConnectionResult.SUCCESS
    }

    AsyncFunction("configure") {
      try {
        val appInfo = context.packageManager.getApplicationInfo(
          context.packageName, 
          android.content.pm.PackageManager.GET_META_DATA
        )
        webClientId = appInfo.metaData?.getString("com.google.android.gms.games.WEB_CLIENT_ID")
        androidClientId = appInfo.metaData?.getString("com.google.android.gms.games.ANDROID_CLIENT_ID")
        
        if (androidClientId == null) {
          throw CodedException(
            "CONFIG_ERROR", 
            "Android client ID not found in AndroidManifest.xml. Add it via the config plugin.", 
            null
          )
        }
        if (webClientId == null) {
          throw CodedException(
            "CONFIG_ERROR", 
            "Web client ID not found in AndroidManifest.xml. Add it via the config plugin.", 
            null
          )
        }

        return@AsyncFunction mapOf(
          "success" to true,
        )
      } catch (e: CodedException) {
        throw e
      } catch (e: Exception) {
        Log.e("EssentialGoogleSignin", "Error configuring Google Sign-In", e)
        throw CodedException("CONFIG_ERROR", e.message ?: "Unknown error", e)
      }
    }

    AsyncFunction("signIn") { promise: Promise ->
      if (!::credentialManager.isInitialized) {
        promise.reject(
          CodedException("NOT_INITIALIZED", "Credential manager not initialized", null)
        )
        return@AsyncFunction
      }
      
      if (webClientId == null) {
        promise.reject(
          CodedException("CONFIG_ERROR", "Google Sign-In is not configured. Call configure() first.", null)
        )
        return@AsyncFunction
      }

      try {
        val rawNonce = UUID.randomUUID().toString()
        val bytes = rawNonce.toByteArray(Charsets.UTF_8)
        val digest = MessageDigest.getInstance("SHA-256").digest(bytes)
        val nonce = digest.fold("") { str, it -> str + "%02x".format(it) }

        val googleIdOption = GetGoogleIdOption.Builder()
          .setFilterByAuthorizedAccounts(false)
          .setServerClientId(webClientId!!)
          .setAutoSelectEnabled(true)
          .setNonce(nonce)
          .build()

        val request = GetCredentialRequest.Builder()
          .addCredentialOption(googleIdOption)
          .build()

        CoroutineScope(Dispatchers.IO).launch {
          try {
            val result = credentialManager.getCredential(
              request = request,
              context = activity
            )
            val signInResult = handleSignInResult(result)
            promise.resolve(signInResult)
          } catch (e: GetCredentialException) {
            Log.e("EssentialGoogleSignin", "Error during sign in", e)
            promise.reject(
              CodedException("SIGN_IN_ERROR", e.message ?: "Sign-in failed", e)
            )
          } catch (e: Exception) {
            Log.e("EssentialGoogleSignin", "Error during sign in", e)
            promise.reject(
              CodedException("SIGN_IN_ERROR", e.message ?: "Unknown error during sign in", e)
            )
          }
        }
      } catch (e: Exception) {
        Log.e("EssentialGoogleSignin", "Error creating sign-in request", e)
        promise.reject(
          CodedException("SIGN_IN_ERROR", e.message ?: "Failed to create sign-in request", e)
        )
      }
    }

    AsyncFunction("signOut") { promise: Promise ->
      if (::credentialManager.isInitialized) {
        CoroutineScope(Dispatchers.IO).launch {
          try {
            val request = ClearCredentialStateRequest()
            credentialManager.clearCredentialState(request)
            promise.resolve(mapOf("success" to true))
          } catch (e: Exception) {
            Log.e("EssentialGoogleSignin", "Error during sign out", e)
            promise.reject(
              CodedException("SIGN_OUT_ERROR", e.message ?: "Failed to sign out", e)
            )
          }
        }
      }
    }
  }

  private fun verifyToken(idTokenString: String): GoogleIdToken.Payload? {
    try {
      if (tokenVerifier == null && webClientId != null) {
        tokenVerifier = GoogleIdTokenVerifier.Builder(
          NetHttpTransport(),
          GsonFactory()
        )
          .setAudience(Collections.singletonList(webClientId))
          .build()
      }

      val idToken = tokenVerifier?.verify(idTokenString)
      return idToken?.payload
    } catch (e: Exception) {
      Log.e("EssentialGoogleSignin", "Error verifying token", e)
      return null
    }
  }

  private fun handleSignInResult(result: GetCredentialResponse): Map<String, Any> {
    val credential = result.credential

    when (credential) {
      is CustomCredential -> {
        if (credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
          try {
            val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)
            val idTokenString = googleIdTokenCredential.idToken
            val payload = verifyToken(idTokenString)

            if (payload != null) {
              return mapOf(
                "success" to true,
                "data" to mapOf(
                  "id" to payload.subject,
                  "email" to (payload.email ?: ""),
                  "emailVerified" to payload.emailVerified,
                  "name" to (payload.get("name") ?: ""),
                  "pictureUrl" to (payload.get("picture") ?: ""),
                  "locale" to (payload.get("locale") ?: ""),
                  "familyName" to (payload.get("family_name") ?: ""),
                  "givenName" to (payload.get("given_name") ?: ""),
                  "idToken" to idTokenString
                )
              )
            } else {
              throw CodedException("TOKEN_ERROR", "Invalid ID token", null)
            }
          } catch (e: GoogleIdTokenParsingException) {
            Log.e("EssentialGoogleSignin", "Invalid Google ID token response", e)
            throw CodedException("TOKEN_ERROR", "Invalid Google ID token response", e)
          } catch (e: CodedException) {
            throw e
          }
        } else {
          throw CodedException("CREDENTIAL_ERROR", "Unexpected credential type: ${credential.type}", null)
        }
      }
      else -> {
        throw CodedException("CREDENTIAL_ERROR", "Unexpected credential type", null)
      }
    }
  }
}
