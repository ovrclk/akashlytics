import { bytesToHumanReadableSize } from "@src/shared/utils/files";
import fs from "fs";
import https from "https";
import {
  Bid,
  DailyNetworkRevenue,
  Deployment,
  DeploymentGroup,
  DeploymentGroupResource,
  Lease,
  PriceHistory,
  sequelize,
  sqliteDatabasePath,
  StatsSnapshot
} from "./schema";

async function download(url, dest) {
  return new Promise<void>((res, rej) => {
    var file = fs.createWriteStream(dest);
    https.get(url, function (response) {
      response.pipe(file);
      file.on("finish", function () {
        file.close();
        res();
      });
    });
  });
}

/**
 * Initiate database schema
 * Restore backup from current version if it exists
 */
export const initDatabase = async () => {
  const shouldDownloadNewDb = true;
  if (shouldDownloadNewDb) {
    if (fs.existsSync(sqliteDatabasePath)) {
      console.log("Deleting existing database files.");
      await fs.promises.rm(sqliteDatabasePath, { force: true });
      await fs.promises.rm("./data/latestDownloadedHeight.txt", { force: true });
      await fs.promises.rm("./data/latestDownloadedTxHeight.txt", { force: true });
    }

    console.log("Downloading database files...");
    await download("https://storage.googleapis.com/akashlytics-deploy-public/database.sqlite", sqliteDatabasePath);
    await download("https://storage.googleapis.com/akashlytics-deploy-public/latestDownloadedHeight.txt", "./data/latestDownloadedHeight.txt");
    await download("https://storage.googleapis.com/akashlytics-deploy-public/latestDownloadedTxHeight.txt", "./data/latestDownloadedTxHeight.txt");
    console.log("Database downloaded");
  }

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  await Lease.sync({ force: false });
  await Deployment.sync({ force: false });
  await DeploymentGroup.sync({ force: true });
  await DeploymentGroupResource.sync({ force: true });
  await Bid.sync({ force: false });
  await StatsSnapshot.sync();
  await PriceHistory.sync({ force: true });
  await DailyNetworkRevenue.sync({ force: true });

  Deployment.hasMany(DeploymentGroup);
  DeploymentGroup.belongsTo(Deployment, { foreignKey: "deploymentId" });

  DeploymentGroup.hasMany(DeploymentGroupResource);
  DeploymentGroupResource.belongsTo(DeploymentGroup, { foreignKey: "deploymentGroupId" });

  Deployment.hasMany(Lease, { foreignKey: "deploymentId" });
  Lease.belongsTo(Deployment);
};

export async function getDbSize() {
  const dbSize = await fs.promises.stat("./data/database.sqlite");
  return bytesToHumanReadableSize(dbSize.size);
}
