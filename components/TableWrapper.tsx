import { TableHTMLAttributes } from 'react'

const TableWrapper = (props: TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="clay-card-soft w-full overflow-x-auto p-2">
      <table {...props} />
    </div>
  )
}

export default TableWrapper
