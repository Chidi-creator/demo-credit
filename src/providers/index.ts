import FlutterwaveBankResolver from "./bankAccount/flutterwave";
import RedisConfig from "./cache/redis";
import NodemailerConfig from "./notification/nodemailer";
import FlutterwaveWalletProvider from "./wallet/flutterwave";
import FlutterwaveTransferProvider from "./wallet/flutterwave-withdrawal";

export const redisConfig = RedisConfig.getInstance();
export const nodemailerConfig = NodemailerConfig.getInstance();
export const flutterwaveBankResolver = FlutterwaveBankResolver.getInstance();
export const flutterwaveWalletProvider = FlutterwaveWalletProvider.getInstance();
export const flutterwaveWithdrawalProvider = FlutterwaveTransferProvider.getInstance();
 
