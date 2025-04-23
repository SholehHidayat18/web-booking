import { useBooking } from "../components/context/BookingContext";
import { useData } from "../components/context/DataContext";
import { useUser } from "../components/context/UserContext";

export const useResetAll = () => {
  const { resetBooking } = useBooking();
  const { resetUser } = useUser();
  const { resetData } = useData();

  const resetAll = () => {
    resetBooking();
    resetUser();
    resetData();
    sessionStorage.clear();
  };

  return resetAll;
};
