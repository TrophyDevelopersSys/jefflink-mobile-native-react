import AppProviders from "./AppProviders";
import RootNavigator from "../navigation/RootNavigator";

export default function AppRoot() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
