import { registerWebModule, NativeModule } from "expo";

import { EssentialGoogleSigninModuleEvents } from "./EssentialGoogleSignin.types";

class EssentialGoogleSigninModule extends NativeModule<EssentialGoogleSigninModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit("onChange", { value });
  }
  hello() {
    return "Hello world! 👋";
  }
}

export default registerWebModule(EssentialGoogleSigninModule);
