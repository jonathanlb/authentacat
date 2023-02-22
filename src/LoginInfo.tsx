import { ContactMail, Password, PsychologyAlt } from "@mui/icons-material";
import { Box, Link, List, ListItem, ListItemIcon, ListItemText, Tooltip, Typography } from "@mui/material"

export function LoginInfo() {
    // Edit the following content to suit your site.
    return (
        <Box className='LoginInstructionsBox'>
            <Typography variant='h3'>
                Login Instructions
            </Typography>
            <List>
                <ListItem alignItems="flex-start">
                    <ListItemIcon>
                        <Tooltip title="What email address do I use?">
                            <ContactMail/>
                        </Tooltip>
                    </ListItemIcon>
                    <ListItemText>
                        Use your email address used on the
                        &nbsp;<Link href="https://mnmando.org/roster">roster</Link>
                        &nbsp;in the Email field above.
                    </ListItemText>
                </ListItem>
                <ListItem alignItems="flex-start">
                    <ListItemIcon>
                        <Tooltip title="Let your browser store your password.">
                            <Password/>
                        </Tooltip>
                    </ListItemIcon>
                    <ListItemText>Enter your password into the Password field above.
                        The password used here is not linked-to/used-by other websites.
                        Consider using your browser's password manager.
                    </ListItemText>
                </ListItem>
                <ListItem alignItems="flex-start">
                    <ListItemIcon>
                        <Tooltip title="Help! I forgot my password!">
                            <PsychologyAlt/>
                        </Tooltip>
                    </ListItemIcon>
                    <ListItemText>
                        <Typography>
                            If you forgot your password, click the "Forgot your password link", enter your email, and click "Send code".
                            You will receive an email from no-reply@verificationemail.com with content like:
                        </Typography>
                        <pre>
                            Your verification code is 123456
                        </pre>
                        <Typography>
                            Use the verification code on the form displayed after you clicked "Send code" and reset your password to one with varying case, a number, and a non-alphanumeric character (!$#...)
                        </Typography>
                        <Typography>
                            Contact Jonathan if you have trouble and he can reset your password manually.
                        </Typography>
                    </ListItemText>
                </ListItem>
            </List>

        </Box>
    );
}