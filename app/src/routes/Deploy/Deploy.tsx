import React from "react";
import { useStyles } from "./Deploy.styles";
import { useMediaQueryContext } from "@src/context/MediaQueryProvider";
import { HelmetSocial } from "@src/shared/components/HelmetSocial";
import { Box, Chip, Grid, Typography } from "@material-ui/core";
import { Button } from "@material-ui/core";
import ReactPlayer from "react-player/lazy";
import YouTubeIcon from "@material-ui/icons/YouTube";
import TwitterIcon from "@material-ui/icons/Twitter";
import GitHubIcon from "@material-ui/icons/GitHub";
import { DiscordIcon } from "@src/shared/components/icons";
import Alert from "@material-ui/lab/Alert";

export interface IDeployProps {}

export const Deploy: React.FunctionComponent<IDeployProps> = ({}) => {
  const classes = useStyles();

  return (
    <>
      <HelmetSocial
        title="Deploy"
        description="Deploy on Akash Network with the first cross-platform desktop application. Decentralized cloud has never been easier to access."
      />
      <div className="container">
        <Typography variant="h1" className={classes.title}>
          Deploy on Akash Network
        </Typography>
        <Typography variant="h3" className={classes.subTitle}>
          In a few clicks!
        </Typography>

        <Box marginTop="1rem" textAlign="center">
          <Typography variant="h5" className={classes.subSubTitle}>
            Akashlytics Deploy is a desktop app that greatly simplifies and enhances deployments on
            the Akash Network.
          </Typography>

          <Box marginTop="2rem">
            <Typography variant="h6">Download</Typography>

            <div className={classes.actionButtonContainer}>
              <Button
                size="large"
                variant="contained"
                classes={{ root: classes.actionButton, label: classes.actionButtonLabel }}
                component="a"
                href="https://storage.googleapis.com/akashlytics-deploy-public/Akashlytics%20Deploy%20Setup%200.2.7.exe"
              >
                Windows
              </Button>

              <Button
                size="large"
                variant="contained"
                classes={{ root: classes.actionButton, label: classes.actionButtonLabel }}
                component="a"
                href="https://storage.googleapis.com/akashlytics-deploy-public/Akashlytics%20Deploy-0.2.7.dmg"
              >
                macOS
              </Button>
            </div>

            <Box display="flex" alignItems="center" justifyContent="center">
              <Chip color="primary" label="BETA" size="small" />
              &nbsp;&nbsp;
              <Typography variant="caption">v0.2.7</Typography>
            </Box>

            <Alert severity="info" className={classes.alert}>
              We haven't set up code signing yet for the mvp, so you will get a warning when
              installing the app!
              <br /> Will be done soon.
            </Alert>
          </Box>
        </Box>

        <Box margin="1rem auto" display="flex" justifyContent="center">
          <ReactPlayer
            url="https://www.youtube.com/watch?v=GNEvWmqW7hI"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          />
        </Box>

        <Box margin="3rem auto 5rem" maxWidth="640px">
          <Box textAlign="center">
            <Typography variant="h4" className={classes.disclaimerTitle}>
              Follow our progress
            </Typography>
          </Box>

          <Grid container spacing={1} className={classes.socials}>
            <Grid item xs={6} sm={3}>
              <a
                href="https://discord.gg/rXDFNYnFwv"
                target="_blank"
                className={classes.socialLink}
              >
                <DiscordIcon className={classes.socialIcon} />
              </a>
            </Grid>
            <Grid item xs={6} sm={3}>
              <a
                href="https://www.youtube.com/channel/UC1rgl1y8mtcQoa9R_RWO0UA?sub_confirmation=1"
                target="_blank"
                className={classes.socialLink}
              >
                <YouTubeIcon className={classes.socialIcon} />
              </a>
            </Grid>
            <Grid item xs={6} sm={3}>
              <a
                href="https://twitter.com/thereisnomax"
                target="_blank"
                className={classes.socialLink}
              >
                <TwitterIcon className={classes.socialIcon} />
              </a>
            </Grid>
            <Grid item xs={6} sm={3}>
              <a
                href="https://github.com/Akashlytics/akashlytics-deploy"
                target="_blank"
                className={classes.socialLink}
              >
                <GitHubIcon className={classes.socialIcon} />
              </a>
            </Grid>
          </Grid>
        </Box>

        <Box margin="5rem auto" maxWidth="640px">
          <Typography variant="h4" className={classes.disclaimerTitle}>
            Disclaimer
          </Typography>

          <u className={classes.disclaimerList}>
            <li>
              Akashlytics Deploy is currently in BETA. We strongly suggest you start with a new
              wallet and a small amount of AKT until we further stabilize the product.
            </li>
            <li>We're not responsible for any loss or damages related to using the app.</li>
            <li>
              The app has a high chance of containing bugs since it's in BETA, use at your own risk.
            </li>
          </u>
        </Box>
      </div>
    </>
  );
};
