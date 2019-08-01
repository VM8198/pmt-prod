

// const baseMediaUrl = "https://www.raoinformationtechnology-conduct.tk/pmt_server/uploads/";
// const baseMediaUrl = "http://132.140.160.72/project_mgmt_tool/server/uploads/";
// const baseMediaUrl = "http://localhost/project_managment_tool/server/uploads/";
    const baseMediaUrl = "https://conduct.raoinformationtechnology.com/server/uploads";




// const baseUrl = "https://www.raoinformationtechnology-conduct.tk:4001/";
// const baseUrl = "http://132.140.160.72:4001/";
const baseUrl = "https://conduct.raoinformationtechnology.com:4001/";
// const baseUrl = "http://192.168.43.66:4001/";




export const config = {
    baseApiUrl: baseUrl,
    baseMediaUrl: baseMediaUrl,
    "priorityList": [
    // { id: "1", value: 'low', colorCode: 'blue' },
    { id: "2", value: 'medium', colorCode: 'yellow' },
    { id: "3", value: 'high', colorCode: 'red' }
    ],
    "statuslist": [
    { id: "1", value: 'to do', colorCode: 'primary' },
    // { id: "2", value: 'in progress', colorCode: 'info' },
    { id: "3", value: 'testing', colorCode: 'warning' },
    { id: "4", value: 'complete', colorCode: 'success' }
    ],
}
