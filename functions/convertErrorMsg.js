//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝ 
//     ██╔██╗   ╚██╔╝   ███╔╝  
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

/*
    * Convert error message to friendly message
    * For admin can understand and fix the problem
*/

const convertErrorMsg = (error) => {
    // Convert the error message to friendly message with switch case
    let friendlyErrorMsg = '';
    switch (error) {
        case 'Authentication error':
            friendlyErrorMsg = 'รหัสผ่านของ RCON ไม่ถูกต้อง';
            break;
        case 'Connection timeout':
            friendlyErrorMsg = 'Connection time out ตรวจสอบ IP และ Port ของ RCON\nหรือตรวจสอบสถานะของเซิร์ฟเวอร์';
            break;
        default:
            friendlyErrorMsg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ โดยไม่ทราบสาเหตุ';
            break;
    }

    // Return the friendly error message
    return friendlyErrorMsg;
}

// Export the module
module.exports = { convertErrorMsg };

//    ██╗  ██╗██╗   ██╗███████╗
//    ╚██╗██╔╝╚██╗ ██╔╝╚══███╔╝
//     ╚███╔╝  ╚████╔╝   ███╔╝
//     ██╔██╗   ╚██╔╝   ███╔╝
// ██╗██╔╝ ██╗   ██║   ███████╗
// ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝