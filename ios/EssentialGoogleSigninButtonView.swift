import ExpoModulesCore
import GoogleSignIn

class EssentialGoogleSigninButtonView: ExpoView {
    let signInButton = GIDSignInButton()
    let onButtonPress = EventDispatcher()

    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        clipsToBounds = true
        signInButton.addTarget(self, action: #selector(handlePress), for: .touchUpInside)
        addSubview(signInButton)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        signInButton.frame = bounds
    }

    @objc private func handlePress() {
        onButtonPress([:])
    }
}