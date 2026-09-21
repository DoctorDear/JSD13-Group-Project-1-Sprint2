import SuccessLayout from "../components/SuccessLayout";

const HERO =
  "https://plus.unsplash.com/premium_photo-1747645829954-9ec54a9a245d?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dx?auto=format&fit=crop&w=900&q=80";

export default function ChangePasswordSuccess() {
  return (
    <SuccessLayout
      image={HERO}
      imageAlt="Woman in a red and white striped jersey"
      title={<>Change password<br />successfully</>}
    />
  );
}