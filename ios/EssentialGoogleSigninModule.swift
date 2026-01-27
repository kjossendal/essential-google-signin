import ExpoModulesCore
import GoogleSignIn

public class EssentialGoogleSigninModule: Module {
    private var webClientId: String?
    private var iosClientId: String?
    
    private func createUserData(from user: GIDGoogleUser, idToken: String) -> [String: Any] {
        return [
            "success": true,
            "data": [
                "id": user.userID ?? "",
                "email": user.profile?.email ?? "",
                "emailVerified": true,
                "name": user.profile?.name ?? "",
                "pictureUrl": user.profile?.imageURL(withDimension: 100)?.absoluteString ?? "",
                "familyName": user.profile?.familyName ?? "",
                "givenName": user.profile?.givenName ?? "",
                "idToken": idToken
            ]
        ]
    }

    public func definition() -> ModuleDefinition {
        Name("EssentialGoogleSignin")
        
        Constants([
            "isAvailable": true
        ])
        
        Events("onChange")
        
        AsyncFunction("hasPlayServices") {
            return true
        }
        
        AsyncFunction("configure") {
            guard let iosClientId = Bundle.main.object(forInfoDictionaryKey: "GIDClientID") as? String else {
                throw NSError(domain: "EssentialGoogleSignin", 
                            code: -1, 
                            userInfo: [NSLocalizedDescriptionKey: "GIDClientID not found in Info.plist"])
            }
            
            self.webClientId = iosClientId
            self.iosClientId = iosClientId
            
            GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: iosClientId)
            
            return [
                "webClientId": iosClientId,
                "iosClientId": iosClientId
            ]
        }
        
        AsyncFunction("signIn") { () async throws -> [String: Any] in
            guard self.webClientId != nil else {
                throw NSError(domain: "EssentialGoogleSignin", 
                            code: -1, 
                            userInfo: [NSLocalizedDescriptionKey: "Google Sign-In is not configured. Call configure() first."])
            }
            
            guard let controller = self.appContext?.utilities?.currentViewController() else {
                throw NSError(domain: "EssentialGoogleSignin", 
                            code: -1, 
                            userInfo: [NSLocalizedDescriptionKey: "Could not get root view controller"])
            }
            
            return try await withCheckedThrowingContinuation { continuation in
                GIDSignIn.sharedInstance.signIn(withPresenting: controller) { result, error in
                    if let error = error {
                        continuation.resume(throwing: error)
                        return
                    }
                    
                    guard let user = result?.user,
                          let idToken = user.idToken?.tokenString else {
                        continuation.resume(throwing: NSError(domain: "EssentialGoogleSignin", 
                                                           code: -1, 
                                                           userInfo: [NSLocalizedDescriptionKey: "Failed to get user token"]))
                        return
                    }
                    
                    let userData = self.createUserData(from: user, idToken: idToken)
                    continuation.resume(returning: userData)
                }
            }
        }
        
        AsyncFunction("signOut") {
            GIDSignIn.sharedInstance.signOut()
        }
    }
}
