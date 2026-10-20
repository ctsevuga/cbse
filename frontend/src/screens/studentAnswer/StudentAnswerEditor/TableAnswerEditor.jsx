import {
  CheckCircle2,
  Columns3,
  Plus,
  Rows3,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const createTable = (rows, columns) =>
  Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => ""),
  );

const TableAnswerEditor = ({
  question,
  answer,
  onChange,
  disabled = false,
}) => {
  const initialTable = useMemo(() => {
    if (
      answer?.answer &&
      typeof answer.answer === "object" &&
      !Array.isArray(answer.answer) &&
      Array.isArray(answer.answer.rows)
    ) {
      return answer.answer.rows;
    }

    if (Array.isArray(answer?.answer)) {
      return answer.answer;
    }

    return createTable(3, 3);
  }, [answer]);

  const [table, setTable] = useState(initialTable);

  useEffect(() => {
    setTable(initialTable);
  }, [initialTable]);

  const columnCount = Math.max(
    table.reduce(
      (max, row) => Math.max(max, row.length),
      0,
    ),
    1,
  );

  const hasAnswer = table.some((row) =>
    row.some(
      (cell) =>
        String(cell ?? "").trim().length > 0,
    ),
  );

  const updateTable = (nextTable) => {
    setTable(nextTable);

    onChange({
      answer: {
        rows: nextTable,
        rowCount: nextTable.length,
        columnCount,
      },
      selectedOption: null,
      attachments: answer?.attachments || [],
    });
  };

  const updateCell = (
    rowIndex,
    columnIndex,
    value,
  ) => {
    const nextTable = table.map((row, currentRow) =>
      row.map((cell, currentColumn) =>
        currentRow === rowIndex &&
        currentColumn === columnIndex
          ? value
          : cell,
      ),
    );

    updateTable(nextTable);
  };

  const addRow = () => {
    if (disabled) return;

    const nextTable = [
      ...table,
      Array.from(
        { length: columnCount },
        () => "",
      ),
    ];

    updateTable(nextTable);
  };

  const removeRow = () => {
    if (disabled || table.length <= 1) return;

    updateTable(table.slice(0, -1));
  };

  const addColumn = () => {
    if (disabled) return;

    const nextTable = table.map((row) => [
      ...row,
      "",
    ]);

    updateTable(nextTable);
  };

  const removeColumn = () => {
    if (disabled || columnCount <= 1) return;

    const nextTable = table.map((row) =>
      row.slice(0, -1),
    );

    updateTable(nextTable);
  };

  const clearTable = () => {
    if (disabled) return;

    const nextTable = createTable(
      table.length,
      columnCount,
    );

    updateTable(nextTable);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Enter your answer
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Enter your answer using the table below.
          </p>
        </div>

        {hasAnswer && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Answer entered
          </span>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-2xl border bg-white ${
          disabled
            ? "border-gray-200 bg-gray-50"
            : "border-gray-300"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={addRow}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Rows3 className="h-4 w-4" />
              Add Row
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={addColumn}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Columns3 className="h-4 w-4" />
              Add Column
            </button>

            <button
              type="button"
              disabled={
                disabled || table.length <= 1
              }
              onClick={removeRow}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove Row
            </button>

            <button
              type="button"
              disabled={
                disabled || columnCount <= 1
              }
              onClick={removeColumn}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove Column
            </button>
          </div>

          <button
            type="button"
            disabled={disabled || !hasAnswer}
            onClick={clearTable}
            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="min-w-full border-collapse">
            <tbody>
              {table.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from(
                    { length: columnCount },
                    (_, columnIndex) => (
                      <td
                        key={columnIndex}
                        className="border border-gray-300 p-0"
                      >
                        <input
                          type="text"
                          value={
                            row[columnIndex] ?? ""
                          }
                          disabled={disabled}
                          onChange={(event) =>
                            updateCell(
                              rowIndex,
                              columnIndex,
                              event.target.value,
                            )
                          }
                          placeholder={`Cell ${
                            rowIndex + 1
                          },${columnIndex + 1}`}
                          className="w-full min-w-[140px] border-0 bg-white px-3 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:bg-blue-50 focus:ring-2 focus:ring-inset focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                        />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
          <span className="text-xs text-gray-500">
            {table.length} rows × {columnCount} columns
          </span>

          {question?.marks && (
            <span className="text-xs font-medium text-gray-500">
              {question.marks} mark
              {question.marks > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableAnswerEditor;