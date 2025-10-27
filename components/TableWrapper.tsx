import { TableHTMLAttributes } from 'react'

const TableWrapper = (props: TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className="w-full overflow-x-auto">
      <table {...props} />
    </div>
  )
}

export default TableWrapper

