import { RouterProvider } from "react-router";
import router from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/providers/auth.provider.jsx";
import { InterviewProvider } from "./features/interview/providers/interview.provider.jsx";

function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;
