import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Base options matching TeeHidZ design system
const customSwalClasses = {
  popup: 'teehidz-swal-popup',
  title: 'teehidz-swal-title',
  htmlContainer: 'teehidz-swal-html',
  confirmButton: 'teehidz-swal-confirm-btn',
  cancelButton: 'teehidz-swal-cancel-btn',
};

export const showSuccess = (title: string, message?: string) => {
  return MySwal.fire({
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'ตกลง',
    customClass: customSwalClasses,
    buttonsStyling: false,
  });
};

export const showError = (title: string, message?: string) => {
  return MySwal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'ตกลง',
    customClass: customSwalClasses,
    buttonsStyling: false,
  });
};

export const showWarning = (title: string, message?: string) => {
  return MySwal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'ตกลง',
    customClass: customSwalClasses,
    buttonsStyling: false,
  });
};

export const showConfirm = async (
  title: string,
  message: string,
  confirmButtonText = 'ยืนยัน',
  cancelButtonText = 'ยกเลิก'
): Promise<boolean> => {
  const result = await MySwal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: customSwalClasses,
    buttonsStyling: false,
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const showToast = (title: string, icon: 'success' | 'info' | 'warning' | 'error' = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: 'teehidz-swal-popup !p-4 !shadow-md',
      title: 'teehidz-swal-title !text-sm',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon,
    title,
  });
};

export default MySwal;
