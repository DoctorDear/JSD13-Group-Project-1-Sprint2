import SuccessLayout from "../components/SuccessLayout";

const HERO =
  "https://plus.unsplash.com/premium_photo-1706830553449-34072101c746?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

export default function VerifyEmailSuccess() {
  return (
    <SuccessLayout
      image={HERO}
      imageAlt="Athlete in a yellow and white jersey standing on a floodlit pitch"
      title={<>Verify email<br />successfully</>}
      redirectTo="/login"
    />
  );
}