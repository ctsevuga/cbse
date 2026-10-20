
import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit,
  Eye,
  FileText,
  Loader2,
  Plus,
  Radio,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  useDeleteStreamMutation,
  useGetStreamsQuery,
} from "../../slices/streamApiSlice";

const StreamListScreen = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const {
    data: streams = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStreamsQuery();

  const [
    deleteStream,
    { isLoading: isDeleting },
  ] = useDeleteStreamMutation();

  const filteredStreams = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return streams.filter((stream) => {
      const matchesSearch =
        !search ||
        stream.name
          ?.toLowerCase()
          .includes(search) ||
        stream.code
          ?.toLowerCase()
          .includes(search) ||
        stream.description
          ?.toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          stream.isActive) ||
        (statusFilter === "inactive" &&
          !stream.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    streams,
    searchTerm,
    statusFilter,
  ]);

  const activeCount = streams.filter(
    (stream) => stream.isActive,
  ).length;

  const inactiveCount =
    streams.length - activeCount;

  const handleView = (id) => {
    navigate(`/streams/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/streams/${id}/edit`);
  };

  const handleDelete = async (stream) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete stream "${stream.name}"?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteStream(
        stream._id,
      ).unwrap();

      refetch();
    } catch (err) {
      window.alert(
        err?.data?.message ||
          err?.error ||
          "Unable to delete stream. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
              <Loader2
                size={30}
                className="animate-spin text-indigo-600"
              />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              Loading streams...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <XCircle
                size={28}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              Unable to load streams
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {error?.data?.message ||
                error?.error ||
                "Something went wrong while loading the streams."}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                <Radio
                  size={24}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  Streams
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage academic streams for your school.
                </p>
              </div>
            </div>

            <Link
              to="/streams/create"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <Plus size={19} />
              Create Stream
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Streams
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {streams.length}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                <Radio
                  size={21}
                  className="text-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2
                  size={21}
                  className="text-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Inactive
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-500">
                  {inactiveCount}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <XCircle
                  size={21}
                  className="text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Stream Directory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredStreams.length} stream
                  {filteredStreams.length !== 1
                    ? "s"
                    : ""}{" "}
                  displayed
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative sm:min-w-[300px]">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value,
                      )
                    }
                    placeholder="Search streams..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                >
                  <option value="all">
                    All Status
                  </option>
                  <option value="active">
                    Active
                  </option>
                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </div>

          {filteredStreams.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Radio
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No streams found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {searchTerm ||
                statusFilter !== "all"
                  ? "Try changing your search or status filter."
                  : "Create your first academic stream to get started."}
              </p>

              {!searchTerm &&
                statusFilter === "all" && (
                  <Link
                    to="/streams/create"
                    className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Plus size={18} />
                    Create Stream
                  </Link>
                )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Stream
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Code
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Description
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStreams.map(
                      (stream) => (
                        <tr
                          key={stream._id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                                <Radio
                                  size={18}
                                  className="text-indigo-600"
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {stream.name}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {stream._id}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold tracking-wide text-slate-700">
                              {stream.code}
                            </span>
                          </td>

                          <td className="max-w-md px-6 py-5">
                            <div className="flex items-start gap-2">
                              <FileText
                                size={17}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />

                              <span className="line-clamp-2 text-sm text-slate-600">
                                {stream.description ||
                                  "No description"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            {stream.isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                <CheckCircle2
                                  size={14}
                                />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                <XCircle
                                  size={14}
                                />
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    stream._id,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                                title="View"
                              >
                                <Eye
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    stream._id,
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                title="Edit"
                              >
                                <Edit
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    stream,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete"
                              >
                                {isDeleting ? (
                                  <Loader2
                                    size={17}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2
                                    size={17}
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 lg:hidden">
                {filteredStreams.map(
                  (stream) => (
                    <div
                      key={stream._id}
                      className="p-5 sm:p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <Radio
                              size={20}
                              className="text-indigo-600"
                            />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-slate-900">
                              {stream.name}
                            </h3>

                            <p className="mt-1 text-xs font-bold tracking-wide text-slate-400">
                              {stream.code}
                            </p>
                          </div>
                        </div>

                        {stream.isActive ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2
                              size={13}
                            />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            <XCircle
                              size={13}
                            />
                            Inactive
                          </span>
                        )}
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <div className="flex items-start gap-2">
                          <FileText
                            size={17}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <p className="text-sm leading-6 text-slate-600">
                            {stream.description ||
                              "No description provided."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleView(
                              stream._id,
                            )
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={17} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              stream._id,
                            )
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          <Edit size={17} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              stream,
                            )
                          }
                          disabled={
                            isDeleting
                          }
                          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2
                              size={17}
                            />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StreamListScreen;
