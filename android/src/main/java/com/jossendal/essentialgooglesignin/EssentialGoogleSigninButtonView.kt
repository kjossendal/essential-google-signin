package com.jossendal.essentialgooglesignin

import android.content.Context
import com.google.android.gms.common.SignInButton
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class EssentialGoogleSigninButtonView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {
  val onButtonPress by EventDispatcher<Map<String, Any>>()
  internal val signInButton = SignInButton(context).also {
    it.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    it.setOnClickListener {
      onButtonPress(mapOf())
    }
    addView(it)
  }
}