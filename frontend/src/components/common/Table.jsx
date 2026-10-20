const Table = ({
  columns = [],

  data = [],

  loading = false,

  emptyMessage = "No records found",

  onRowClick,

  className = "",

}) => {



  return (

    <div
      className={`table-container ${className}`}
    >



      {
        loading ? (

          <div className="table-loading">

            Loading...

          </div>

        ) : data.length === 0 ? (

          <div className="table-empty">

            {emptyMessage}

          </div>

        ) : (


          <table>


            <thead>

              <tr>


                {
                  columns.map(
                    (column) => (

                      <th
                        key={
                          column.key
                        }
                      >

                        {
                          column.label
                        }

                      </th>

                    )
                  )
                }


              </tr>

            </thead>



            <tbody>


              {
                data.map(
                  (row, rowIndex) => (

                    <tr

                      key={
                        row._id ||
                        rowIndex
                      }

                      onClick={() =>
                        onRowClick &&
                        onRowClick(row)
                      }

                      className={
                        onRowClick
                          ? "clickable-row"
                          : ""
                      }

                    >


                      {
                        columns.map(
                          (column) => (

                            <td
                              key={
                                column.key
                              }
                            >


                              {
                                column.render

                                  ? column.render(
                                      row
                                    )

                                  : row[
                                      column.key
                                    ] ?? "-"

                              }


                            </td>

                          )
                        )
                      }


                    </tr>

                  )
                )
              }


            </tbody>


          </table>


        )
      }


    </div>

  );

};


export default Table;