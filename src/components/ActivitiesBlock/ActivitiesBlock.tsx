import { FC, useState, MouseEvent, useMemo, useEffect } from "react";
import { ESide, EOrder, EBulletType } from "../../enums/enums";
import { IActivity } from "../../interfaces/interfaces";

import Activity from "../Activity/Activity";
import BaseTooltip from "../Base/Tooltip/BaseTooltip";
import BaseButton from "../Base/Button/BaseButton";
import { dateFormating, sortDates } from "../../Utils/utils";

interface INegateSides {
  [ESide.LEFT]: string;
  [ESide.RIGHT]: string
};

const negateSides: INegateSides = {
  [ESide.LEFT]: ESide.RIGHT,
  [ESide.RIGHT]: ESide.LEFT
};

type Props = {
  activities: IActivity[];
  index?: number;
  blockText: string | Date;
  folded?: boolean;
  maxActivities?: number;
  activitiesOffset?: number;
  activitiesOrder?: string;
  autoActivities?: boolean;
  bulletsType?: string;
  blockBulletsType?: string;
  activitiesLoadCount?: string | boolean;
};

const ActivitiesBlock: FC<Props> = ({
  index = 0,
  activities,
  blockText,
  folded,
  maxActivities = 5,
  activitiesOffset = 5,
  activitiesOrder = EOrder.DESC,
  autoActivities = false,
  activitiesLoadCount = "",
  bulletsType = EBulletType.NUMERIC,
  blockBulletsType = EBulletType.NUMERIC
}) => {
  const [mappedActivities, setMappedActivities] = useState(activities);
  const [showCount, setShowCount] = useState(false);
  const [loadCount, setLoadCount] = useState(activitiesLoadCount);
  const [showActivities, setShowActivities] = useState(!folded);
  const [activitiesLimit, setActivitiesLimit] = useState(maxActivities);
  const [moreButtonText, setMoreButtonText] = useState("more");

  const mapActivities = useMemo(
    () => (activities: IActivity[]): IActivity[] => {
      let currentSide: string = ESide.RIGHT;
      const mapped: IActivity[] = activities
        .sort((a, b) => {
          return sortDates(a.date, b.date, activitiesOrder);
        })
        .map((activity, i) => {
          const { date } = activity;
          const prev: IActivity = activities[i - 1] || null;
          if (!prev) {
            return { ...activity, side: ESide.RIGHT };
          }
          if (+date !== +prev.date) {
            currentSide = negateSides[currentSide as keyof INegateSides];
          }
          return { ...activity, side: currentSide };
        });
      return mapped;
    },
    [activitiesOrder]
  );

  const sideClass = (side: string = ESide.RIGHT): string => {
    return side === ESide.LEFT ? "flex-row-reverse" : "";
  };

  const showActivitiesCount = (e: MouseEvent): void => {
    setShowCount(!showCount);
  };

  const loadMoreActivities = () => {
    setActivitiesLimit((prevSatate) => prevSatate + activitiesOffset);
    if (loadCount && !isNaN(+loadCount)) {
      const count = `${+loadCount - activitiesOffset}`;
      setLoadCount(count);
      setMoreButtonText(`more (${count})`);
    }
  };

  const toggleActivities = (): void => {
    setShowActivities(!showActivities);
  };

  useEffect(() => {
    if (autoActivities) {
      if (!!activitiesLoadCount && activitiesLimit < activities.length) {
        const count = `${activities.length - activitiesLimit}`;
        setLoadCount(count);
        setMoreButtonText(`more (${count})`);
      }
      setMappedActivities(mapActivities(activities));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const classes = {
    wrapper: (
      className: string | undefined,
      side: string | undefined
    ): string =>
      `activity-wrapper mb-8 flex justify-between items-center w-full ${sideClass(
        side
      )} ${className || ""} cursor-default`,
    indexes: {
      wrapper:
        "z-20 flex items-center order-1 bg-gray-800 mx-auto shadow-md max-w-1 h-8 rounded-full transform hover:-translate-y-1 hover:scale-110 transition duration-200 ease-linear",
      bullet: "min-w-1 mx-auto font-semibold text-md text-white text-center p-2"
    }
  };

  const bulletType: { [key: string]: string } = {
    [EBulletType.NUMERIC]: `${index + 1}`,
    [EBulletType.TIMING]: `${blockText}`
  };
  const blockBulletText = bulletType[blockBulletsType];

  return (
    <div
      className="block-wrapper mt-20 cursor-pointer relative flex flex-col items-center"
      data-testid="activities-block"
    >
      {showActivities
        ? mappedActivities.map((activity, i) => {
            if (activitiesLimit && i >= activitiesLimit) return null;
            let { className, side, date } = activity;
            const bulletType: { [key: string]: string } = {
              [EBulletType.NUMERIC]: `${i + 1}`,
              [EBulletType.TIMING]: dateFormating(date)
            };
            const bulletText = bulletType[bulletsType];
            return (
              <div
                className={classes.wrapper(className, side)}
                key={i}
                data-testid="activity-wrapper"
              >
                <div className="order-1 w-5/12"></div>
                <div className={classes.indexes.wrapper}>
                  <h1 className={classes.indexes.bullet}>{bulletText}</h1>
                </div>
                <Activity activity={activity} />
              </div>
            );
          })
        : null}
      {showCount ? <BaseTooltip text={activities.length} /> : null}
      {activities.length > activitiesLimit && showActivities ? (
        <div
          className="button-wrapper mx-auto"
          data-testid="load-more-activities"
        >
          <BaseButton
            type={"primary"}
            text={moreButtonText}
            click={loadMoreActivities}
          />
        </div>
      ) : null}
      <div
        data-testid="bullet"
        className={`${classes.indexes.wrapper} min-w-2`}
        onMouseEnter={showActivitiesCount}
        onMouseLeave={showActivitiesCount}
        onClick={toggleActivities}
      >
        <h1 className={classes.indexes.bullet}>{blockBulletText}</h1>
      </div>
    </div>
  );
};

export default ActivitiesBlock;
