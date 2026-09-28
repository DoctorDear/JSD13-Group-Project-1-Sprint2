import AuthLayout, { AuthTitle } from "./AuthLayout";

export default function SuccessLayout({
  image,
  imageAlt,
  title,
  subtitle,
}) 
{
  return (
    <AuthLayout image={image} imageAlt={imageAlt} showBackButton>
      <AuthTitle>{title}</AuthTitle>
      {subtitle && <p className="mt-6 text-lg text-gray-900">{subtitle}</p>}
    </AuthLayout>
  );
}
