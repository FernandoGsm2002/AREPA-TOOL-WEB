import { Pin } from "lucide-react";
import { resellerApi } from "../../lib/reseller-api";
import { dateTime } from "../../lib/reseller-i18n";
import { Empty, ResourceState, useReseller, useResource } from "./shared";
export default function Announcements() {
  const { t, language } = useReseller();
  const resource = useResource(() => resellerApi("announcements", {}));
  const items = resource.data?.items
    .slice()
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  return (
    <div className="rs-announcements rs-stack">
      <ResourceState {...resource} retry={resource.refresh} />
      {items?.length === 0 && <Empty>{t("noAnnouncements")}</Empty>}
      {items?.map((item) => (
        <article className="rs-panel" key={item.id}>
          <div className="rs-announcement-meta">
            <time dateTime={item.createdAt}>
              {dateTime(item.createdAt, language)}
            </time>
            {item.pinned && (
              <span className="rs-tag">
                <Pin size={13} aria-hidden="true" />
                {t("pinned")}
              </span>
            )}
          </div>
          <h2>{item.title}</h2>
          <p className="rs-plaintext">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
