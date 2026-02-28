import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

export const toastSuccess = (message = 'Success!') => {
  Toast.fire({
    icon: 'success',
    title: message,
    iconColor: '#27ae60',
  });
};

export const toastError = (message = 'Something went wrong!') => {
  Toast.fire({
    icon: 'error',
    title: message,
  });
};

export const toastInfo = (message = '') => {
  Toast.fire({
    icon: 'info',
    title: message,
  });
};

export const toastWarning = (message = '') => {
  Toast.fire({
    icon: 'warning',
    title: message,
  });
};

export const confirmDelete = async (
  message = 'Do you want to proceed?',
  options = {}
) => {
  const {
    title = 'Are you sure?',
    icon = 'question',
    confirmButtonText = 'OK',
    cancelButtonText = 'Cancel',
    confirmButtonColor = '#27ae60',
    cancelButtonColor = '#6c757d',
  } = options;

  return await Swal.fire({
    title,
    text: message,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
  });
};
