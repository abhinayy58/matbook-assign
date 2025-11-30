import { Navigate, Route, Routes } from "react-router-dom";
import CreateFormPage from "./pages/CreateForm";
import PreviewPage from "./pages/Preview";
import MyFormsPage from "./pages/MyForms";
import AllForms from "./pages/AllForms";
import SubmissionsPage from "./pages/Submissions";

export default function App() {
  return (
    <Routes>
        <Route path="/forms" element={<PreviewPage />} />

          <Route path="/create" element={<CreateFormPage />} />
          <Route path="/create/:id" element={<CreateFormPage />} />
          <Route path="/preview" element={<PreviewPage />} />
          <Route path="/preview/:id" element={<PreviewPage />} />
          <Route path="/myforms" element={<MyFormsPage />} />
          <Route path="/submissions" element={<AllForms />} />
          <Route path="/submissions/:id" element={<SubmissionsPage />} />
        <Route path="*" element={<Navigate to="/forms" replace />} />
    </Routes>
  );
}
