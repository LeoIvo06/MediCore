CREATE FUNCTION "signal_incident_notification"() RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('medicore_incident_notifications', NEW."recipientId");
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "incident_notification_inserted"
AFTER INSERT ON "incident_notifications"
FOR EACH ROW EXECUTE FUNCTION "signal_incident_notification"();
