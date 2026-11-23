"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { MOCK_CUSTOMERS } from "@/services/mock-data";
import { useAdminStore } from "@/services/AdminStoreContext";
import type { CustomerLinkItem } from "@/types";
import { formatCurrencyVND, formatDateTime } from "@/lib/format";
import { SlideOver } from "@/components/ui/SlideOver";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

function normalizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "").replace(/^84/, "0");
}

const V2_MOCK_DIRECTORY: Array<{
  customerCode: string;
  phoneNumber: string;
  customerName: string;
  serviceAddress: string;
  meterNumber: string | null;
}> = [
  {
    customerCode: "01030001",
    phoneNumber: "0945744417",
    customerName: "Nguyễn Văn An",
    serviceAddress: "12 Nguyễn Trãi, Phường 1",
    meterNumber: "DH001",
  },
  {
    customerCode: "01030002",
    phoneNumber: "0945744417",
    customerName: "Nguyễn Văn An (Nhà 2)",
    serviceAddress: "35 Lê Lợi, Phường 2",
    meterNumber: "DH002",
  },
  {
    customerCode: "01030007",
    phoneNumber: "0909123456",
    customerName: "Lê Minh Tuấn",
    serviceAddress: "88 Hai Bà Trưng, Phường Đa Kao, Quận 1",
    meterNumber: "DH007",
  },
  {
    customerCode: "01030008",
    phoneNumber: "0912345678",
    customerName: "Phạm Thị Lan",
    serviceAddress: "45 Trần Hưng Đạo, Phường Cầu Ông Lãnh, Quận 1",
    meterNumber: "DH008",
  },
];

function CustomersContent() {
  const searchParams = useSearchParams();
  const { showSuccessAlert, hasPermission } = useAdminStore();
  const canCreate = hasPermission("customers.create");
  const canUpdate = hasPermission("customers.update");
  const canDelete = hasPermission("customers.delete");
  const [customers, setCustomers] = useState<CustomerLinkItem[]>(MOCK_CUSTOMERS);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerLinkItem | null>(null);
  const [customerToDelete, setCustomerToDelete] =
    useState<CustomerLinkItem | null>(null);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [pendingV2Profile, setPendingV2Profile] = useState<
    (typeof V2_MOCK_DIRECTORY)[number] | null
  >(null);

  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<CustomerLinkItem | null>(null);
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    customerCode?: string;
    phoneNumber?: string;
    customerName?: string;
    verify?: string;
  }>({});

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      const id = window.requestAnimationFrame(() => {
        setEditingCustomer(null);
        setCustomerCode("");
        setCustomerName("");
        setPhoneNumber("");
        setServiceAddress("");
        setMeterNumber("");
        setFieldErrors({});
        setFormDrawerOpen(true);
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((cus) => {
      if (!q) return true;
      return (
        cus.customerCode.toLowerCase().includes(q) ||
        cus.customerName.toLowerCase().includes(q) ||
        cus.phoneNumber.toLowerCase().includes(q) ||
        (cus.meterNumber?.toLowerCase().includes(q) ?? false) ||
        cus.serviceAddress.toLowerCase().includes(q)
      );
    });
  }, [customers, query]);

  const openCreateForm = () => {
    setEditingCustomer(null);
    setCustomerCode("");
    setCustomerName("");
    setPhoneNumber("");
    setServiceAddress("");
    setMeterNumber("");
    setFieldErrors({});
    setFormDrawerOpen(true);
  };

  const openEditForm = (cus: CustomerLinkItem) => {
    setEditingCustomer(cus);
    setCustomerCode(cus.customerCode);
    setCustomerName(cus.customerName);
    setPhoneNumber(cus.phoneNumber);
    setServiceAddress(cus.serviceAddress);
    setMeterNumber(cus.meterNumber ?? "");
    setFieldErrors({});
    setFormDrawerOpen(true);
  };

  const handleSaveCustomer = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanCode = customerCode.trim().toUpperCase();
    const cleanPhone = phoneNumber.trim();
    const errors: {
      customerCode?: string;
      phoneNumber?: string;
      customerName?: string;
      verify?: string;
    } = {};

    if (!cleanCode) {
      errors.customerCode = "Vui lòng nhập mã khách hàng.";
    }
    if (!cleanPhone) {
      errors.phoneNumber = "Vui lòng nhập số điện thoại đăng ký.";
    }

    if (editingCustomer) {
      const cleanName = customerName.trim();
      if (!cleanName) {
        errors.customerName = "Vui lòng nhập tên khách hàng.";
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
      setPendingV2Profile(null);
      setSaveConfirmOpen(true);
      return;
    }

    if (cleanCode) {
      const alreadyLinked = customers.some(
        (c) => c.customerCode.toUpperCase() === cleanCode
      );
      if (alreadyLinked) {
        errors.customerCode = "Mã khách hàng này đã được liên kết.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const normalizedInputPhone = normalizePhone(cleanPhone);
    const v2Profile = V2_MOCK_DIRECTORY.find(
      (item) =>
        item.customerCode.toUpperCase() === cleanCode &&
        normalizePhone(item.phoneNumber) === normalizedInputPhone
    );

    if (!v2Profile) {
      setFieldErrors({
        verify:
          "Mã khách hàng hoặc số điện thoại không khớp với hồ sơ V2 Quản lý khách hàng.",
      });
      return;
    }

    setPendingV2Profile(v2Profile);
    setSaveConfirmOpen(true);
  };

  const confirmSaveCustomer = () => {
    const cleanPhone = phoneNumber.trim();
    const now = new Date().toISOString();

    if (editingCustomer) {
      const cleanName = customerName.trim();
      const cleanAddress = serviceAddress.trim() || "Chưa cập nhật";
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                customerName: cleanName,
                phoneNumber: cleanPhone,
                serviceAddress: cleanAddress,
                meterNumber: meterNumber.trim() || null,
                updatedAt: now,
              }
            : c
        )
      );
      showSuccessAlert(`Đã cập nhật thông tin khách hàng "${cleanName}".`);
    } else if (pendingV2Profile) {
      const created: CustomerLinkItem = {
        id: `lnk-${Date.now()}`,
        userId: `usr-app-${Date.now().toString().slice(-4)}`,
        customerCode: pendingV2Profile.customerCode,
        customerName: pendingV2Profile.customerName,
        phoneNumber: cleanPhone,
        serviceAddress: pendingV2Profile.serviceAddress,
        meterNumber: pendingV2Profile.meterNumber,
        createdAt: now,
        updatedAt: now,
        unpaidCount: 0,
        unpaidTotal: 0,
      };
      setCustomers((prev) => [created, ...prev]);
      showSuccessAlert(
        `Đã xác minh và liên kết khách hàng "${pendingV2Profile.customerName}".`
      );
    }

    setSaveConfirmOpen(false);
    setPendingV2Profile(null);
    setFormDrawerOpen(false);
  };

  const confirmDeleteCustomer = () => {
    if (!customerToDelete) return;
    setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
    if (selectedCustomer?.id === customerToDelete.id) {
      setSelectedCustomer(null);
    }
    showSuccessAlert(
      `Đã hủy liên kết khách hàng "${customerToDelete.customerName}".`
    );
    setCustomerToDelete(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mã KH, họ tên, SĐT, số đồng hồ..."
            className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-foreground-subtle focus:border-primary focus:outline-none"
          />
        </div>

        {canCreate ? (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            <span>Liên kết khách hàng mới</span>
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <Users className="h-8 w-8 text-foreground-subtle" />
            <p className="mt-3 text-sm font-medium text-foreground">
              Không tìm thấy khách hàng phù hợp
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              Thử đổi từ khóa tìm kiếm (mã khách hàng, số đồng hồ).
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover"
            >
              Xóa từ khóa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs font-medium text-foreground-muted">
                <tr>
                  <th className="px-5 py-3">Mã khách hàng</th>
                  <th className="px-4 py-3">Tên khách hàng</th>
                  <th className="px-4 py-3">Địa chỉ sử dụng nước</th>
                  <th className="px-4 py-3">Số đồng hồ</th>
                  <th className="px-4 py-3 text-right">Dư nợ hiện tại</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((cus) => (
                  <tr
                    key={cus.id}
                    className="transition-colors duration-150 hover:bg-surface-hover"
                  >
                    <td className="px-5 py-3 font-mono text-sm font-medium text-foreground">
                      {cus.customerCode}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {cus.customerName}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-muted">
                        {cus.phoneNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-muted">
                      {cus.serviceAddress}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-foreground">
                      {cus.meterNumber ?? (
                        <span className="font-sans text-sm text-foreground-subtle">
                          Chưa cập nhật
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {cus.unpaidTotal > 0 ? (
                        <span className="font-medium text-foreground">
                          {formatCurrencyVND(cus.unpaidTotal)}
                        </span>
                      ) : (
                        <span className="text-sm text-foreground-subtle">
                          Không có nợ
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ActionMenu
                        ariaLabel={`Thao tác cho ${cus.customerName}`}
                        items={[
                          {
                            label: "Xem chi tiết",
                            icon: <Eye className="h-3.5 w-3.5" />,
                            onClick: () => setSelectedCustomer(cus),
                          },
                          ...(canUpdate
                            ? [
                                {
                                  label: "Chỉnh sửa thông tin",
                                  icon: <Pencil className="h-3.5 w-3.5" />,
                                  onClick: () => openEditForm(cus),
                                },
                              ]
                            : []),
                          ...(canDelete
                            ? [
                                {
                                  label: "Hủy liên kết khách hàng",
                                  icon: <Trash2 className="h-3.5 w-3.5" />,
                                  tone: "danger" as const,
                                  onClick: () => setCustomerToDelete(cus),
                                },
                              ]
                            : []),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SlideOver
        open={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.customerName ?? ""}
        subtitle={
          selectedCustomer
            ? `Mã khách hàng: ${selectedCustomer.customerCode}`
            : undefined
        }
      >
        {selectedCustomer ? (
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-foreground-subtle">Số điện thoại</dt>
              <dd className="mt-1 tabular-nums font-medium text-foreground">
                {selectedCustomer.phoneNumber}
              </dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-foreground-subtle">Số đồng hồ</dt>
              <dd className="mt-1 font-mono font-medium text-foreground">
                {selectedCustomer.meterNumber ?? "Chưa cập nhật"}
              </dd>
            </div>
            <div className="rounded-lg border border-border p-3 sm:col-span-2">
              <dt className="text-xs text-foreground-subtle">
                Địa chỉ sử dụng nước
              </dt>
              <dd className="mt-1 text-foreground">
                {selectedCustomer.serviceAddress}
              </dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-foreground-subtle">Dư nợ hiện tại</dt>
              <dd className="mt-1 tabular-nums font-medium text-foreground">
                {selectedCustomer.unpaidTotal > 0
                  ? formatCurrencyVND(selectedCustomer.unpaidTotal)
                  : "Không có nợ"}
              </dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-foreground-subtle">Mã tài khoản liên kết</dt>
              <dd className="mt-1 font-mono text-xs text-foreground">
                {selectedCustomer.userId}
              </dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-foreground-subtle">Ngày liên kết</dt>
              <dd className="mt-1 tabular-nums text-foreground">
                {formatDateTime(selectedCustomer.createdAt)}
              </dd>
            </div>
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-foreground-subtle">Cập nhật cuối</dt>
              <dd className="mt-1 tabular-nums text-foreground">
                {formatDateTime(selectedCustomer.updatedAt)}
              </dd>
            </div>
          </dl>
        ) : null}
      </SlideOver>

      <SlideOver
        open={formDrawerOpen}
        onClose={() => setFormDrawerOpen(false)}
        title={
          editingCustomer
            ? "Cập nhật thông tin khách hàng"
            : "Liên kết khách hàng mới"
        }
        subtitle={
          editingCustomer
            ? `Mã khách hàng: ${editingCustomer.customerCode}`
            : "Nhập mã khách hàng và số điện thoại để xác minh qua V2"
        }
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4" noValidate>
          {fieldErrors.verify ? (
            <p className="rounded-lg bg-danger-tint px-3 py-2 text-xs font-medium text-danger-tint-ink">
              {fieldErrors.verify}
            </p>
          ) : null}

          <div>
            <label
              htmlFor="cus-code"
              className="block text-xs font-medium text-foreground-muted"
            >
              Mã khách hàng <span className="text-danger">*</span>
            </label>
            <input
              id="cus-code"
              type="text"
              disabled={Boolean(editingCustomer)}
              value={customerCode}
              onChange={(e) => {
                setCustomerCode(e.target.value);
                if (fieldErrors.customerCode || fieldErrors.verify) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    customerCode: undefined,
                    verify: undefined,
                  }));
                }
              }}
              placeholder="Ví dụ: 01030007"
              className={`mt-1.5 h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm text-foreground disabled:opacity-60 focus:outline-none ${
                fieldErrors.customerCode
                  ? "border-danger focus:border-danger"
                  : "border-border focus:border-primary"
              }`}
            />
            {fieldErrors.customerCode ? (
              <p className="mt-1 text-xs text-danger">
                {fieldErrors.customerCode}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="cus-phone"
              className="block text-xs font-medium text-foreground-muted"
            >
              Số điện thoại đăng ký <span className="text-danger">*</span>
            </label>
            <input
              id="cus-phone"
              type="text"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (fieldErrors.phoneNumber || fieldErrors.verify) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    phoneNumber: undefined,
                    verify: undefined,
                  }));
                }
              }}
              placeholder="Ví dụ: 0909123456 hoặc +84909123456"
              className={`mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none ${
                fieldErrors.phoneNumber
                  ? "border-danger focus:border-danger"
                  : "border-border focus:border-primary"
              }`}
            />
            {fieldErrors.phoneNumber ? (
              <p className="mt-1 text-xs text-danger">
                {fieldErrors.phoneNumber}
              </p>
            ) : null}
          </div>

          {!editingCustomer ? (
            <div className="rounded-lg border border-border bg-surface-subtle p-3 text-xs text-foreground-muted">
              <p className="font-medium text-foreground">
                Tự động đồng bộ từ V2 Quản lý khách hàng
              </p>
              <p className="mt-1">
                Tên khách hàng, địa chỉ sử dụng nước và số đồng hồ sẽ được lấy tự
                động sau khi xác minh khớp mã và số điện thoại.
              </p>
              <p className="mt-1.5 font-mono text-[11px] text-foreground-subtle">
                Thử nhanh: 01030007 · 0909123456 (hoặc 01030008 · 0912345678)
              </p>
            </div>
          ) : (
            <>
              <div>
                <label
                  htmlFor="cus-name"
                  className="block text-xs font-medium text-foreground-muted"
                >
                  Tên khách hàng <span className="text-danger">*</span>
                </label>
                <input
                  id="cus-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (fieldErrors.customerName) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        customerName: undefined,
                      }));
                    }
                  }}
                  placeholder="Họ tên hoặc tên đơn vị"
                  className={`mt-1.5 h-9 w-full rounded-lg border bg-background px-3 text-sm text-foreground focus:outline-none ${
                    fieldErrors.customerName
                      ? "border-danger focus:border-danger"
                      : "border-border focus:border-primary"
                  }`}
                />
                {fieldErrors.customerName ? (
                  <p className="mt-1 text-xs text-danger">
                    {fieldErrors.customerName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="cus-meter"
                  className="block text-xs font-medium text-foreground-muted"
                >
                  Số đồng hồ
                </label>
                <input
                  id="cus-meter"
                  type="text"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value)}
                  placeholder="Ví dụ: DH001"
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="cus-address"
                  className="block text-xs font-medium text-foreground-muted"
                >
                  Địa chỉ sử dụng nước
                </label>
                <textarea
                  id="cus-address"
                  rows={2}
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setFormDrawerOpen(false)}
              className="h-9 rounded-lg border border-border bg-surface px-4 text-xs font-medium text-foreground hover:bg-surface-hover"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="h-9 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary-hover"
            >
              {editingCustomer ? "Lưu thay đổi" : "Xác minh & liên kết"}
            </button>
          </div>
        </form>
      </SlideOver>

      <ConfirmDialog
        open={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={confirmDeleteCustomer}
        title="Xác nhận hủy liên kết khách hàng"
        description={
          customerToDelete ? (
            <>
              Bạn có chắc chắn muốn hủy liên kết khách hàng{" "}
              <strong className="font-semibold text-foreground">
                {customerToDelete.customerName}
              </strong>{" "}
              (mã{" "}
              <span className="font-mono text-foreground">
                {customerToDelete.customerCode}
              </span>
              ) khỏi hệ thống không?
            </>
          ) : null
        }
        confirmLabel="Xác nhận hủy liên kết"
        tone="danger"
      />

      <ConfirmDialog
        open={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        onConfirm={confirmSaveCustomer}
        title={
          editingCustomer
            ? "Xác nhận lưu thông tin khách hàng"
            : "Xác nhận liên kết khách hàng"
        }
        description={
          editingCustomer ? (
            <>
              Bạn có chắc chắn muốn lưu các thay đổi cho khách hàng{" "}
              <strong className="font-semibold text-foreground">
                {customerName.trim()}
              </strong>
              ?
            </>
          ) : pendingV2Profile ? (
            <>
              Đã tìm thấy hồ sơ{" "}
              <strong className="font-semibold text-foreground">
                {pendingV2Profile.customerName}
              </strong>{" "}
              (mã{" "}
              <span className="font-mono text-foreground">
                {pendingV2Profile.customerCode}
              </span>
              ) tại {pendingV2Profile.serviceAddress}. Xác nhận liên kết vào hệ
              thống?
            </>
          ) : null
        }
        confirmLabel={editingCustomer ? "Lưu thay đổi" : "Xác nhận liên kết"}
        tone="primary"
      />
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-border bg-surface p-6 text-sm text-foreground-muted">
          Đang tải danh sách khách hàng...
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}
