import { useAppDispatch } from "../../store/hooks";
import { clearAuth } from "../../store/auth/authSlice";

export default function ClientHomePage() {
  const dispatch = useAppDispatch();

  return (
    <div className="p-4">
      Client Home
      <button
        className="ml-3 border px-3 py-2 rounded"
        onClick={() => dispatch(clearAuth())}
      >
        Clear Auth
      </button>
    </div>
  );
}
