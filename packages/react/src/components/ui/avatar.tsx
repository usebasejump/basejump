import BoringAvatar from "boring-avatars";
import { Appearance } from "../../types/appearance.ts";

type Props = {
  uniqueId?: string;
  size?: number;
  appearance?: Appearance;
};
export const Avatar = ({ uniqueId, size = 25, appearance }: Props) => (
  <BoringAvatar
    size={size}
    name={uniqueId}
    variant="marble"
    colors={appearance?.theme?.default?.colors?.avatarBackgrounds}
  />
);
