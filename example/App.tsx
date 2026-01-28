import EssentialGoogleSignin, { GoogleUserData } from "essential-google-signin";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function App() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [user, setUser] = useState<GoogleUserData | null>(null);

  // Automatically configure Google Sign-In when the app starts
  useEffect(() => {
    // Skip configuration on web (native module not available)
    if (Platform.OS === "web") {
      console.log("Google Sign-In is not available on web");
      return;
    }

    const configure = async () => {
      try {
        const result = await EssentialGoogleSignin.configure();
        console.log("Google Sign-In configured:", result);
        setIsConfigured(true);
      } catch (error) {
        console.error("Failed to configure Google Sign-In:", error);
      }
    };
    configure();
  }, []);

  const signIn = async () => {
    try {
      const result = await EssentialGoogleSignin.signIn();
      console.log("Sign in successful:", result);
      setUser(result.data);
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  };

  const signOut = async () => {
    try {
      const result = await EssentialGoogleSignin.signOut();
      console.log("Sign out successful:", result);
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Google Sign-In Example</Text>
        <Group name="Configuration Status">
          <Text style={{ marginBottom: 10 }}>
            {isConfigured ? "✅ Configured" : "⏳ Configuring..."}
          </Text>
        </Group>
        <Group name="Google Sign-In">
          {Platform.OS === "web" ? (
            <Text style={{ color: "#666" }}>
              ⚠️ Google Sign-In is only available on iOS and Android.{"\n"}
              Please test on a mobile device or simulator.
            </Text>
          ) : user ? (
            <>
              <Text>Welcome, {user.name}!</Text>
              <Button title="Sign Out" onPress={signOut} />
            </>
          ) : (
            <>
              <Button
                title="Sign In with Google"
                onPress={signIn}
                disabled={!isConfigured}
              />
              <Text style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
                {!isConfigured && "Waiting for configuration..."}
              </Text>
            </>
          )}
        </Group>
        <Group name="Debug Functions">
          <Button
            title="Check Play Services"
            onPress={async () => {
              const result = await EssentialGoogleSignin.hasPlayServices();
              Alert.alert("Play Services available:", result.toString());
              console.log("Play Services available:", result);
            }}
          />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
  },
  group: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },
  view: {
    flex: 1,
    height: 200,
  },
};
