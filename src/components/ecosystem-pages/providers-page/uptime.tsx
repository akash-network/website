import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

type Props = {
  value: number;
};

export const Uptime: React.FunctionComponent<Props> = ({ value }) => {
  const intl = useIntl();
  const [color, setColor] = useState("green"); // Default color is green
  const [disableCount, setDisableCount] = useState(0);

  const [uptime, setUptime] = useState(
    intl.formatNumber(value, {
      style: "percent",
      maximumFractionDigits: 0,
    }),
  );

  useEffect(() => {
    // Update color and disableCount based on the percentage value
    if (parseFloat(uptime) > 80) {
      setDisableCount(0);
    } else if (parseFloat(uptime) > 60) {
      setDisableCount(2);
    } else if (parseFloat(uptime) > 40) {
      setDisableCount(4);
    } else if (parseFloat(uptime) > 20) {
      setDisableCount(6);
    } else {
      setDisableCount(7);
    }
  }, [uptime]);

  return (
    <div className="flex w-full gap-x-1">
      {[...Array(7)].map((_, index) => (
        <div
          key={index}
          className={`flex h-1 w-full ${
            index >= 7 - disableCount ? "bg-gray-200" : `bg-[#73EA94]`
          }`}
        ></div>
      ))}
    </div>
  );
};
