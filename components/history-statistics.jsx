import { Plus, Gift, User } from "lucide-react"

const HistoryStatistics = ({ history, showAllRecords }) => {
  return (
    <>
      {history.slice(0, showAllRecords ? history.length : 4).map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-xl border-2 border-primary/20 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                item.type === "earn" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {item.type === "earn" ? (
                <Plus className="h-5 w-5 text-green-600" />
              ) : (
                <Gift className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {item.childName}
                </span>
                <span className="text-muted-foreground">|</span>
                <span>{item.date}</span>
                {item.wrongAnswers !== undefined && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-amber-600">错题: {item.wrongAnswers}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 font-bold ${item.type === "earn" ? "text-green-600" : "text-red-600"}`}
          >
            {item.type === "earn" ? "+" : "-"}
            {item.points}
          </div>
        </div>
      ))}
    </>
  )
}

export default HistoryStatistics

