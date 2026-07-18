import { Link } from "react-router-dom";

function RoleCard({ to, title, description }) {
  return (
    <Link
      to={to}
      className="flex-1 border rounded-2xl p-8 text-center hover:border-[#1D263A] hover:shadow-md transition"
    >
      <p className="text-2xl font-semibold mb-2">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}

export default function Roleselector() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 px-6">
      <p className="text-4xl font-semibold text-center">
        Choose your account type
      </p>
      <div className="flex w-full max-w-2xl gap-6">
        <RoleCard
          to="/signup/innovator"
          title="Innovator"
          description="Pitch your startup and find sponsors."
        />
        <RoleCard
          to="/signup/sponsor"
          title="Sponsor"
          description="Discover and fund promising startups."
        />
      </div>
      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/login/innovator" className="text-blue-600">
          Log in as innovator
        </Link>{" "}
        or{" "}
        <Link to="/login/sponsor" className="text-blue-600">
          sponsor
        </Link>
      </p>
    </div>
  );
}
