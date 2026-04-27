import type { DeviceInstance } from './types';

export const clampZoom = (zoom: number) => Math.min(200, Math.max(10, Math.round(zoom)));

export const getZoomScale = (zoom: number) => clampZoom(zoom) / 100;

export const getScaledFrameSize = (width: number, height: number, zoom: number) => {
  const scale = getZoomScale(zoom);

  return {
    width: width * scale,
    height: height * scale,
  };
};

export const getDeviceWrapperSize = (device: Pick<DeviceInstance, 'width' | 'height'>, zoom: number) =>
  getScaledFrameSize(device.width, device.height, zoom);

export const rotateDimensions = ({ width, height }: Pick<DeviceInstance, 'width' | 'height'>) => ({
  width: height,
  height: width,
});

export const rotateDevice = <T extends Pick<DeviceInstance, 'width' | 'height'>>(device: T): T => ({
  ...device,
  ...rotateDimensions(device),
});
