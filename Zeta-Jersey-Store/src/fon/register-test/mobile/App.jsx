// App.jsx
import RegisterScreen from "./RegisterScreen";

export default function App() {
  return (
    <RegisterScreen
      onSubmit={data => console.log("Register:", data)}
      onSocial={provider => console.log("Sign in with", provider)}
    />
  );
}