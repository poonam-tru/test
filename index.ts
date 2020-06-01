import * as tcpPortUsed from "tcp-port-used";
import meta_data from "../database/index";
import * as cp from "child_process";
import config from "../../constants/index";
import * as os from "os";
import * as fs from "fs";
import * as shell from "shelljs";
import env_function from "../Environment/os-environment";

export const portForProject = async callback => {
  let mapToArray = {};
  let port: any;
  let availablePortList: Array<number> = [];
  let used_port_list = meta_data.getPortNumbers();
  for (port in used_port_list) {
    mapToArray[used_port_list[port].port_number] = true;
  }
  console.log(mapToArray);

  callback({
    percentage_one: 5,
    percentage_two: 0,
    percentage_three: 0
  });

  for (let i = 40000; i < 50000; i++) {
    if (mapToArray[i] != true) {
      let status: boolean = await checkPortStatus(i, getVmIp().host_ip);
      if (status) {
        availablePortList.push(i);
        callback({
          percentage_one: 5 + availablePortList.length * 5,
          percentage_two: 0,
          percentage_three: 0
        });
        if (availablePortList.length == 5) {
          break;
        }
      }
    }
  }
  if (availablePortList.length < 5) {
    throw new Error("Warning: Port pool not free!");
  } else {
    return availablePortList;
  }
};

const checkPortStatus = (
  port_number: number,
  machine_ip: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    tcpPortUsed.check(port_number, machine_ip).then(
      function(inUse) {
        if (inUse) {
          //port not free
          resolve(false);
        } else {
          resolve(true);
        }
      },
      function(err) {
        resolve(false);
      }
    );
  });
};

export const getIp = (): string => {
  try {
    let host_ip: string = cp.execSync(
      `"${env_function.getDockerFolder()}" ip ${config.VM_NAME}`,
      {
        encoding: "utf8"
      }
    );
    host_ip = host_ip.trim();
    return host_ip;
  } catch (err) {}
};

export const getVmIp = () => {
  try {
    let host_ip: string = cp.execSync(
      `"${env_function.getDockerFolder()}" ip ${config.VM_NAME}`,
      {
        encoding: "utf8"
      }
    );
    host_ip = host_ip.trim();
    return { error: false, message: "", host_ip: host_ip };
  } catch (err) {
    return { error: true, message: err };
  }
};

export const formatJSDate = dt => {
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "June",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  let day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    day[dt.getDay()] +
    ", " +
    months[dt.getMonth()] +
    " " +
    dt.getDate() +
    " " +
    dt.getFullYear()
  );
};

export const imageToFileName = name => {
  return name.replace(/\:|\./gi, "_");
};

export const memoryToUse = (): number => {
  let ram = os.totalmem() / 1024 / 1024 / 1024;
  if (ram <= 4) {
    ram = 1024;
  } else if (ram > 4 && ram <= 6) {
    ram = 2048;
  } else {
    ram = 3072;
  }
  return ram;
};

export const deleteFolder = loc => {
  if (fs.existsSync(loc)) {
    shell.rm("-rf", loc);
  }
};

export const isAuthenticated = (): boolean => {
  if (
    localStorage.getItem("i") &&
    localStorage.getItem("t") &&
    localStorage.getItem("e")
  ) {
    let login_date: number = new Date(localStorage.getItem("time")).getTime();
    console.log(login_date);
    let current_date: number = new Date().getTime();
    let time_difference = (current_date - login_date) / 1000; //millisec to sec conversion
    console.log("login check time diff " + time_difference);
    if (time_difference > 172800) {
      console.log("2 days check login again");
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

export const setAuthentication = (parseUrl: {
  t: string;
  e: string;
  i: string;
}) => {
  let date: string = new Date().toString();
  localStorage.setItem("t", parseUrl.t);
  localStorage.setItem("e", parseUrl.e);
  localStorage.setItem("i", parseUrl.i);
  localStorage.setItem("time", date);
};
