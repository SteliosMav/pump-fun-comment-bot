import { isAxiosError } from "axios";
import chalk from "chalk";

export function ExceptionFilter(e: unknown) {
  if (isAxiosError(e)) {
    if (!e.status) {
      // Expected error: something went wrong with SSL certificate and proxy
      console.error(chalk.red("SSL certificate error:"), e.code);
    } else if ([500, 502].includes(e.status)) {
      // Possible error: pump.fun or proxy server overload
      console.log(
        chalk.red(
          `Comment failed due to a pump.fun or proxy server overload. Status: ${e.status}`
        )
      );
    } else {
      // Unexpected error
      const importantData = {
        status: e.response?.status,
        statusText: e.response?.statusText,
        data: e.response?.data,
      };
      console.log(
        chalk.red("Unexpected error while commenting:"),
        importantData
      );
    }
  } else {
    // Unexpected error
    console.error(chalk.red("Non-Axios error:"), e);
  }
}
