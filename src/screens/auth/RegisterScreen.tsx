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

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
}

export default function RegisterScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { register, status } = useAuth();
  const { control, handleSubmit } = useForm<RegisterForm>({
    defaultValues: { fullName: "", email: "", password: "" }
  });

  const onSubmit = handleSubmit(async (values) => {
    await register(values);
  });

  return (
    <ScreenWrapper className="px-6 pt-10">
      <View className="gap-8">
        <Header
          title="Create account"
          subtitle="Finance-ready access in minutes"
        />

        <View className="gap-4">
          <Controller
            control={control}
            name="fullName"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <Input
                label="Full name"
                value={value}
                placeholder="Jane Doe"
                onChangeText={onChange}
              />
            )}
          />
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
          label={status === "loading" ? "Creating..." : "Create account"}
          onPress={onSubmit}
          disabled={status === "loading"}
        />

        <View className="items-center">
          <Text className="text-sm text-brand-muted">
            Already have an account?
          </Text>
          <Button
            label="Back to login"
            variant="ghost"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
