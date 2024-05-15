// const { tasks } = require("../users.json");
// import users from "../users.json";
// 8058771857: Dharmendrfa ji``

class Validator {
  static validateUserInfo(userInfo) {
    if (
      userInfo.hasOwnProperty("userName") &&
      userInfo.hasOwnProperty("password") &&
      userInfo.hasOwnProperty("preferences") &&
      Array.isArray(userInfo["preferences"]) &&
      userInfo["preferences"].length > 0
    ) {
      return { status: true, message: "Validated Successfully" };
    } else {
      return {
        status: false,
        message: "User info is malformed",
      };
    }
  }

  static validatePreferences(preferences) {
    if (!Array.isArray(preferences)) {
      return { status: false, message: "Please send in the list format" };
    } else if (preferences.length == 0) {
      return {
        status: false,
        message: "At least one preference should bs there",
      };
    } else {
      return { status: true, message: "Validated successfully" };
    }
  }

  //   static validateTaskId(taskId) {
  //     if (tasks.find((task) => task.id == taskId)) {
  //       return { status: true, message: "taskId Validated Successfully" };
  //     } else {
  //       return {
  //         status: false,
  //         message: "Task Id is incorrect",
  //       };
  //     }
  //   }
}

module.exports = Validator;

// console.log(Array.isArray(1));
