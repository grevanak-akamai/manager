import { Divider, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Drawer } from 'src/components/Drawer';
import { Link } from 'src/components/Link';
import { useProfile } from 'src/queries/profile/profile';
import { formatDate } from 'src/utilities/formatDate';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';

import { AccessSelect } from './AccessSelect';

import type { ObjectStorageEndpointTypes } from '@linode/api-v4/lib/object-storage';

export interface ObjectDetailsDrawerProps {
  bucketName: string;
  clusterId: string;
  displayName?: string;
  endpointType?: ObjectStorageEndpointTypes;
  lastModified?: null | string;
  name?: string;
  onClose: () => void;
  open: boolean;
  size?: null | number;
  url?: string;
}

export const ObjectDetailsDrawer = React.memo(
  (props: ObjectDetailsDrawerProps) => {
    const { data: profile } = useProfile();
    const {
      bucketName,
      clusterId,
      displayName,
      endpointType,
      lastModified,
      name,
      onClose,
      open,
      size,
      url,
    } = props;
    let formattedLastModified;

    try {
      if (lastModified) {
        formattedLastModified = formatDate(lastModified, {
          timezone: profile?.timezone,
        });
      }
    } catch {}

    const isAccessSelectEnabled =
      open && name && endpointType !== 'E2' && endpointType !== 'E3';

    return (
      <Drawer
        onClose={onClose}
        open={open}
        title={truncateMiddle(displayName ?? 'Object Detail')}
      >
        {size ? (
          <Typography variant="subtitle2">
            {readableBytes(size).formatted}
          </Typography>
        ) : null}
        {formattedLastModified && Boolean(profile) ? (
          <Typography data-testid="lastModified" variant="subtitle2">
            Last modified: {formattedLastModified}
          </Typography>
        ) : null}

        {url ? (
          <StyledLinkContainer>
            <Link external to={url}>
              {truncateMiddle(url, 50)}
            </Link>
            <StyledCopyTooltip sx={{ marginLeft: 4 }} text={url} />
          </StyledLinkContainer>
        ) : null}

        {isAccessSelectEnabled ? (
          <>
            <Divider spacingBottom={16} spacingTop={16} />
            <AccessSelect
              bucketName={bucketName}
              clusterOrRegion={clusterId}
              endpointType={endpointType}
              name={name}
              variant="object"
            />
          </>
        ) : null}
      </Drawer>
    );
  }
);

const StyledCopyTooltip = styled(CopyTooltip, {
  label: 'StyledCopyTooltip',
})(() => ({
  marginLeft: '1em',
  padding: 0,
}));

const StyledLinkContainer = styled('div', {
  label: 'StyledLinkContainer',
})(() => ({
  display: 'flex',
}));
