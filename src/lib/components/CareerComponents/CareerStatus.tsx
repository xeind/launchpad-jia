export default function CareerStatus({ status }: { status: string }) {
    const getStatusStyles = () => {
        switch (status) {
            case "active":
                return {
                    backgroundColor: "#ECFDF3",
                    border: "1px solid #A6F4C5",
                    dotColor: "#12B76A",
                    textColor: "#027948",
                    label: "Published"
                };
            case "draft":
                return {
                    backgroundColor: "#FEF3C7",
                    border: "1px solid #FDE68A",
                    dotColor: "#F59E0B",
                    textColor: "#92400E",
                    label: "Draft"
                };
            default: // inactive
                return {
                    backgroundColor: "#F5F5F5",
                    border: "1px solid #E9EAEB",
                    dotColor: "#717680",
                    textColor: "#414651",
                    label: "Unpublished"
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <div style={{ 
            borderRadius: "60px", 
            display: "flex", 
            flexDirection: "row", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "5px", 
            padding: "0px 8px", 
            backgroundColor: styles.backgroundColor,
            border: styles.border,
            }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: styles.dotColor }}></div>
        <span style={{ fontSize: "12px", fontWeight: 700, color: styles.textColor }}>
            {styles.label}
        </span>
        </div>
    )
}