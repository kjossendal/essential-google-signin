import EssentialGoogleSignin, {
  EssentialGoogleSigninView,
} from "essential-google-signin";
import { useEvent } from "expo";
import { Button, SafeAreaView, ScrollView, Text, View } from "react-native";

export default function App() {
  const onChangePayload = useEvent(EssentialGoogleSignin, "onChange");

  const configureGoogleSignIn = async () => {
    const result = await EssentialGoogleSignin.configure();
    console.log(result);
  };

  const signIn = async () => {
    const result = await EssentialGoogleSignin.signIn();
    console.log(result);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        <Group name="Events">
          <Text>{JSON.stringify(onChangePayload)}</Text>
        </Group>
        <Group name="Constants">
          <Text>{EssentialGoogleSignin.PI}</Text>
        </Group>
        {/* <Group name="Functions">
          <Text>{EssentialGoogleSignin.hello()}</Text>
        </Group> */}
        <Group name="Async functions">
          <Button
            title="Has play services"
            onPress={async () => {
              const result = await EssentialGoogleSignin.hasPlayServices();
              console.log(result);
            }}
          />
          <Button
            title="Set value"
            onPress={async () => {
              await EssentialGoogleSignin.setValueAsync("Hello from JS!");
            }}
          />
          <Button title="Configure" onPress={configureGoogleSignIn} />
          <Button title="Sign in" onPress={signIn} />
        </Group>
        <Group name="Views">
          <EssentialGoogleSigninView
            url="https://www.example.com"
            onLoad={({ nativeEvent: { url } }) => console.log(`Loaded: ${url}`)}
            style={styles.view}
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
