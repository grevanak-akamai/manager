import { Accordion, Toggle, Typography } from '@linode/ui';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { FormControlLabel } from 'src/components/FormControlLabel';

interface Props {
  networkHelperEnabled: boolean;
  onChange: () => void;
}

const NetworkHelper = ({ networkHelperEnabled, onChange }: Props) => {
  return (
    <Accordion defaultExpanded={true} heading="Network Helper">
      <Grid container direction="column" spacing={2}>
        <Grid>
          <Typography variant="body1">
            Network Helper automatically deposits a static networking
            configuration into your Linode at boot.
          </Typography>
        </Grid>
        <Grid alignItems="center" container direction="row">
          <Grid>
            <FormControlLabel
              control={
                <Toggle
                  checked={networkHelperEnabled}
                  data-qa-toggle-network-helper
                  onChange={onChange}
                />
              }
              label={
                networkHelperEnabled ? 'Enabled (default behavior)' : 'Disabled'
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </Accordion>
  );
};

export default NetworkHelper;
