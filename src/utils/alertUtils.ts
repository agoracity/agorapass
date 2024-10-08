import Swal from 'sweetalert2';

export const showLoadingAlert = () => {
    Swal.fire({
        title: 'Processing...',
        text: 'Please wait while your request is being processed.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const showErrorAlert = (message: string) => {
    Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: message,
    });
};

export const showSuccessAlert = (message: string, confirmText: string, redirectUrl: string) => {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Close',
        cancelButtonColor: '#d33',
        confirmButtonColor: '#3085d6',
    }).then((result: { isConfirmed: any; }) => {
        if (result.isConfirmed) {
            window.open(redirectUrl, '_blank');
        }
    });
};

export const showOnlySucessWithRedirect = (message: string, confirmText: string, redirectUrl: string) => {
    Swal.fire({
        title: "Zupass connected!",
        text: message,
        confirmButtonText: confirmText,
        allowOutsideClick: false,
        icon: "success"
      }).then((result: { isConfirmed: any; }) => {
        if (result.isConfirmed) {
            // router.push(redirectUrl)
            window.location.href = redirectUrl;
        }
    });

};

export const showCopySuccessAlert = () => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast: { addEventListener: (arg0: string, arg1: any) => void; }) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })

    Toast.fire({
        icon: 'success',
        title: 'Address copied to clipboard'
    })
}

export const showErrorAlertWithSpace = (title: string, message: string) => {
    Swal.fire({
        icon: 'error',
        title: title,
        html: message.replace(/\n/g, '<br>'),
    });
};

export const showSuccessAlertWithoutRedirect = (message: string, confirmText: string = 'OK') => {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        confirmButtonText: confirmText,
        confirmButtonColor: '#3085d6',
    });
};