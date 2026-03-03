import { Text, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ScreenWrapper from "../../components/layout/ScreenWrapper";
import Header from "../../components/layout/Header";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { validators } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import type { AuthStackParamList } from "../../navigation/AuthNavigator";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { signIn, status } = useAuth();
  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = handleSubmit(async (values) => {
    await signIn(values.email, values.password);
  });

  return (
    <ScreenWrapper className="px-6 pt-10">
      <View className="gap-8">
        <Header title="Welcome back" subtitle="Secure access to JEFFLink" />

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            rules={{ required: true, validate: validators.email }}
            render={({ field: { value, onChange } }) => (
              <Input
                label="Email"
                value={value}
                placeholder="name@company.com"
                onChangeText={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            rules={{ required: true, validate: validators.password }}
            render={({ field: { value, onChange } }) => (
              <Input
                label="Password"
                value={value}
                placeholder="********"
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <Button
          label={status === "loading" ? "Signing in..." : "Sign in"}
          onPress={onSubmit}
          disabled={status === "loading"}
        />

        <View className="items-center">
          <Text className="text-sm text-brand-muted">No account yet?</Text>
          <Button
            label="Create account"
            variant="ghost"
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
