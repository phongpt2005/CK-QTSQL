import React, { useState, useCallback, useEffect } from 'react';
import { Form, Input, InputNumber, DatePicker, Select, Button, Typography, Space, Divider, Table, Tag, Alert, message, Modal, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, ExportOutlined, ArrowLeftOutlined, WarningOutlined, ThunderboltFilled, CameraOutlined, WifiOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreateSalesOrder, useCustomers, useProducts, useWarehouses, useLocations } from '@/hooks/queries';
import { useAuthStore } from '@/store/auth.store';
import { inventoryService } from '@/services';
import { useAllocationSocket, DraftReservation } from '@/hooks/useAllocationSocket';
import QRScannerModal from '@/components/QRScannerModal';
import { QRCodeSVG } from 'qrcode.react';
import numeral from 'numeral';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface LineItem {
  key: number;
  productId: number;
  productName: string;
  warehouseId: number;
  locationId: number;
  quantity: number;
  unitPrice: number;
  availableStock: number | null; // null = not checked yet
  stockChecking: boolean;
  stockLocations?: { warehouseId: number, locationId: number, availableQty: number }[];
  isSuggested?: boolean;
}

interface AllocationDraft {
  originalKey: number;
  productId: number;
  productName: string;
  requiredQty: number;
  allocations: {
    warehouseId: number;
    warehouseName?: string;
    locationId: number;
    locationCode?: string;
    availableQty: number;
    allocatedQty: number;
  }[];
}

export default function CreateSalesOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [items, setItems] = useState<LineItem[]>([]);
  const [nextKey, setNextKey] = useState(1);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [allocationDrafts, setAllocationDrafts] = useState<AllocationDraft[] | null>(null);
  
  // ── QR Scanner state ──
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'product' | 'location'>('product');
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [confirmedLocations, setConfirmedLocations] = useState<Set<string>>(new Set());

  // ── Demo QR state ──
  const [demoQrModalVisible, setDemoQrModalVisible] = useState(false);
  const [demoQrProductCode, setDemoQrProductCode] = useState<string>('');
  const [demoLocationQrCode, setDemoLocationQrCode] = useState<string | null>(null);

  // ── Auth ──
  const user = useAuthStore((s) => s.user);

  // ── Data ──
  const { data: productsData } = useProducts({ limit: 200 });

  // ── Socket.io connection ──
  const { connected, emitScanProduct, emitScanLocation, emitDraftUpdate, emitDraftConfirm, emitDraftCancel } = useAllocationSocket({
    userId: user?.id ?? null,
    onModalOpen: (draft: DraftReservation) => {
      // Convert server draft to local AllocationDraft format and open modal
      const localDraft: AllocationDraft = {
        originalKey: Date.now(),
        productId: draft.productId,
        productName: draft.productName,
        requiredQty: draft.requiredQty,
        allocations: draft.allocations.map(a => ({
          warehouseId: a.warehouseId,
          warehouseName: a.warehouseName,
          locationId: a.locationId,
          locationCode: a.locationCode,
          availableQty: a.availableQty,
          allocatedQty: a.allocatedQty,
        })),
      };
      setActiveDraftId(draft.draftId);
      setAllocationDrafts([localDraft]);
      setPreviewModalVisible(true);
      setConfirmedLocations(new Set());
      message.info(`Đã quét: ${draft.productName} — Xem gợi ý phân bổ bên dưới`);
    },
    onModalClose: (data) => {
      if (data.cancelled) {
        message.info('Phân bổ đã bị hủy.');
      } else if (data.draft && activeDraftId === data.draft.draftId) {
        // Another device confirmed it! Apply the server draft to our local items.
        message.success('Thiết bị khác đã xác nhận phân bổ thành công!');
        setItems(prevItems => {
          let currentNextKey = nextKey;
          let finalItems: LineItem[] = [...prevItems];
          const serverDraft = data.draft!;
          
          // Use current timestamp as original key if it doesn't exist
          const originalKey = allocationDrafts?.[0]?.originalKey || Date.now();
          
          let itemIndex = finalItems.findIndex(i => i.key === originalKey);
          let item = itemIndex >= 0 ? finalItems[itemIndex] : {
            key: originalKey,
            productId: serverDraft.productId,
            productName: serverDraft.productName,
            warehouseId: 0,
            locationId: 0,
            quantity: serverDraft.requiredQty,
            unitPrice: Number(productsData?.data?.find(p => p.id === serverDraft.productId)?.price || 0),
            availableStock: null,
            stockChecking: false,
          } as LineItem;

          if (itemIndex >= 0) {
            finalItems.splice(itemIndex, 1);
          }

          const activeAllocations = serverDraft.allocations.filter(a => a.allocatedQty > 0);
          let originalItemUsed = false;

          for (const alloc of activeAllocations) {
            finalItems.push({
              ...item,
              key: !originalItemUsed && itemIndex >= 0 ? item.key : currentNextKey++,
              warehouseId: alloc.warehouseId,
              locationId: alloc.locationId,
              quantity: alloc.allocatedQty,
              availableStock: alloc.availableQty,
              stockChecking: false,
              isSuggested: true
            });
            originalItemUsed = true;
          }

          const totalAllocated = activeAllocations.reduce((s, a) => s + a.allocatedQty, 0);
          if (totalAllocated < serverDraft.requiredQty) {
            finalItems.push({
              ...item,
              key: !originalItemUsed && itemIndex >= 0 ? item.key : currentNextKey++,
              warehouseId: 0,
              locationId: 0,
              quantity: serverDraft.requiredQty - totalAllocated,
              availableStock: 0,
              stockChecking: false,
              isSuggested: true
            });
          }
          
          setNextKey(currentNextKey);
          return finalItems;
        });
      }

      setPreviewModalVisible(false);
      setActiveDraftId(null);
      setConfirmedLocations(new Set());
    },
    onStateUpdate: (draft: DraftReservation) => {
      // Sync state from another device of the same user
      if (!allocationDrafts) return;
      setAllocationDrafts([{
        originalKey: allocationDrafts[0]?.originalKey ?? Date.now(),
        productId: draft.productId,
        productName: draft.productName,
        requiredQty: draft.requiredQty,
        allocations: draft.allocations.map(a => ({
          warehouseId: a.warehouseId,
          warehouseName: a.warehouseName,
          locationId: a.locationId,
          locationCode: a.locationCode,
          availableQty: a.availableQty,
          allocatedQty: a.allocatedQty,
        })),
      }]);
    },
    onStockUpdate: () => {
      // Another user changed stock — refetch inventory if currently viewing
      // This triggers re-rendering of available stock columns
      message.info('Tồn kho đã được cập nhật bởi nhân viên khác.', 2);
    },
    onLocationConfirmed: (data) => {
      setConfirmedLocations(prev => new Set(prev).add(data.locationCode));
      message.success(`Đã xác nhận vị trí: ${data.locationCode}`);
    },
    onError: (data) => {
      message.error(data.message);
    },
  });

  // Auto-trigger scan if URL has ?scan=PROD001
  useEffect(() => {
    if (!connected) return;
    
    const params = new URLSearchParams(location.search);
    const scanCode = params.get('scan');
    const ownerId = params.get('ownerId');
    
    if (scanCode) {
      // Remove query param from URL without reloading
      navigate(location.pathname, { replace: true });
      
      // Give it a tiny delay to ensure everything is mounted
      setTimeout(() => {
        const tid = ownerId ? Number(ownerId) : undefined;
        message.loading(`Đang đồng bộ lệnh quét (Target User: ${tid || 'N/A'})...`, 2);
        emitScanProduct(scanCode, 1, tid);
      }, 500);
    }
  }, [connected, location.search, location.pathname, navigate, emitScanProduct]);

  const { data: customers } = useCustomers();
  const { data: warehouses } = useWarehouses();
  const { data: locations } = useLocations();

  const isConfirmDisabled = React.useMemo(() => {
    // If not a QR-scan-initiated draft, no scan required
    if (!activeDraftId || !allocationDrafts) return false;
    
    // Check if there are any allocations with qty > 0 that haven't been confirmed
    for (const draft of allocationDrafts) {
      for (const alloc of draft.allocations) {
        if (alloc.allocatedQty > 0) {
          const loc = locations?.find((l) => l.id === alloc.locationId);
          if (loc && !confirmedLocations.has(loc.locationCode)) {
            return true; // Found an unconfirmed location
          }
        }
      }
    }
    return false;
  }, [activeDraftId, allocationDrafts, locations, confirmedLocations]);

  const createMut = useCreateSalesOrder();

  const products = productsData?.data ?? [];

  const addItem = () => {
    setItems([...items, { key: nextKey, productId: 0, productName: '', warehouseId: 0, locationId: 0, quantity: 1, unitPrice: 0, availableStock: null, stockChecking: false }]);
    setNextKey(nextKey + 1);
  };

  const fetchStockLocations = useCallback(async (key: number, productId: number) => {
    if (!productId) return;
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, stockChecking: true, availableStock: null, warehouseId: 0, locationId: 0 } : i));
    try {
      const summary = await inventoryService.getByProduct(productId);
      const stockLocs = (summary.details || [])
        .map((d: any) => ({
          warehouseId: d.warehouseId,
          locationId: d.locationId,
          availableQty: d.availableQty ?? d.quantity
        }))
        .filter((d: any) => d.availableQty > 0);
        
      setItems((prev) => prev.map((i) => {
        if (i.key !== key) return i;
        let whId = 0, locId = 0, avail = null;
        if (stockLocs.length === 1) {
          whId = stockLocs[0].warehouseId;
          locId = stockLocs[0].locationId;
          avail = stockLocs[0].availableQty;
        } else if (stockLocs.length > 1) {
          const uniqueWhs = [...new Set(stockLocs.map((l: any) => l.warehouseId))];
          if (uniqueWhs.length === 1) whId = uniqueWhs[0];
        }
        return { ...i, stockLocations: stockLocs, stockChecking: false, warehouseId: whId, locationId: locId, availableStock: avail };
      }));
    } catch {
      setItems((prev) => prev.map((i) => i.key === key ? { ...i, stockChecking: false, stockLocations: [] } : i));
    }
  }, []);

  const updateItem = (key: number, field: keyof LineItem, value: any) => {
    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.key !== key) return i;
        const item = { ...i, [field]: value } as LineItem;
        
        if (field === 'productId') {
          const p = products.find((pp) => pp.id === value);
          item.productName = p?.productName ?? '';
          item.unitPrice = Number(p?.price ?? 0);
          item.warehouseId = 0;
          item.locationId = 0;
          item.availableStock = null;
          item.stockLocations = [];
        }
        
        if (field === 'warehouseId') {
          item.locationId = 0;
          item.availableStock = null;
          const locsForWh = item.stockLocations?.filter(l => l.warehouseId === value) || [];
          if (locsForWh.length === 1) {
            item.locationId = locsForWh[0].locationId;
            item.availableStock = locsForWh[0].availableQty;
          }
        }
        
        if (field === 'locationId') {
           const loc = item.stockLocations?.find(l => l.warehouseId === item.warehouseId && l.locationId === value);
           item.availableStock = loc ? loc.availableQty : 0;
        }
        
        return item;
      });
      return updated;
    });

    if (field === 'productId' && value) {
      fetchStockLocations(key, value);
    }
  };

  const removeItem = (key: number) => setItems(items.filter((i) => i.key !== key));

  const confirmAllocation = () => {
    if (allocationDrafts) {
      let currentNextKey = nextKey;
      let finalItems: LineItem[] = [...items];
      let hasError = false;
      let allocatedCount = 0;
      
      for (const draft of allocationDrafts) {
         let itemIndex = finalItems.findIndex(i => i.key === draft.originalKey);
         
         // Create a base item for properties
         let item = itemIndex >= 0 ? finalItems[itemIndex] : {
            key: draft.originalKey,
            productId: draft.productId,
            productName: draft.productName,
            warehouseId: 0,
            locationId: 0,
            quantity: draft.requiredQty,
            unitPrice: Number(products.find(p => p.id === draft.productId)?.price || 0),
            availableStock: null,
            stockChecking: false,
         } as LineItem;
         
         // Remove the original un-allocated item if it exists, as we will replace it with split items
         if (itemIndex >= 0) {
            finalItems.splice(itemIndex, 1);
         }
         
         const activeAllocations = draft.allocations.filter(a => a.allocatedQty > 0);
         let originalItemUsed = false;
         
         for (const alloc of activeAllocations) {
            finalItems.push({
               ...item,
               key: !originalItemUsed && itemIndex >= 0 ? item.key : currentNextKey++,
               warehouseId: alloc.warehouseId,
               locationId: alloc.locationId,
               quantity: alloc.allocatedQty,
               availableStock: alloc.availableQty,
               stockChecking: false,
               isSuggested: true
            });
            originalItemUsed = true;
         }
         
         const totalAllocated = activeAllocations.reduce((s, a) => s + a.allocatedQty, 0);
         if (totalAllocated < draft.requiredQty) {
            hasError = true;
            finalItems.push({
               ...item,
               key: !originalItemUsed && itemIndex >= 0 ? item.key : currentNextKey++,
               warehouseId: 0,
               locationId: 0,
               quantity: draft.requiredQty - totalAllocated,
               availableStock: 0,
               stockChecking: false,
               isSuggested: true
            });
         } else {
            allocatedCount++;
         }
      }
      
      setItems(finalItems);
      setNextKey(currentNextKey);
      if (allocatedCount > 0 && !hasError) message.success('Đã áp dụng phân bổ thành công!');
      else if (hasError) message.warning('Một số sản phẩm không được phân bổ đủ số lượng!');
    }
    // Also notify socket if this was a socket-initiated draft
    if (activeDraftId) {
      emitDraftConfirm(activeDraftId);
      setActiveDraftId(null);
    }
    setPreviewModalVisible(false);
    setConfirmedLocations(new Set());
  };

  const handleDraftChange = (draftIdx: number, allocIdx: number, val: number | null) => {
    if (!allocationDrafts) return;
    const newDrafts = [...allocationDrafts];
    const newAllocations = [...newDrafts[draftIdx].allocations];
    newAllocations[allocIdx] = { ...newAllocations[allocIdx], allocatedQty: val || 0 };
    newDrafts[draftIdx] = { ...newDrafts[draftIdx], allocations: newAllocations };
    setAllocationDrafts(newDrafts);
    // Emit to socket for real-time sync (debounced)
    if (activeDraftId) {
      emitDraftUpdate(activeDraftId, newAllocations.map(a => ({
        warehouseId: a.warehouseId,
        warehouseName: a.warehouseName,
        locationId: a.locationId,
        locationCode: a.locationCode,
        availableQty: a.availableQty,
        allocatedQty: a.allocatedQty,
      })));
    }
  };

  const doAutoAllocate = (targetKeys: number[]) => {
    let drafts: typeof allocationDrafts = [];
    let hasChanges = false;
    
    for (const item of items) {
      if (!targetKeys.includes(item.key) || !item.productId || !item.quantity || item.quantity <= 0 || !item.stockLocations || item.stockLocations.length === 0) {
        continue;
      }
      
      // Mặc định những thằng đã đủ rồi thì không cần phải allocate nữa
      if (item.warehouseId && item.locationId && item.availableStock !== null && item.availableStock >= item.quantity) {
        continue;
      }
      
      hasChanges = true;
      // Sắp xếp ưu tiên các vị trí có tồn lớn nhất
      const sortedLocs = [...item.stockLocations].sort((a, b) => b.availableQty - a.availableQty);
      let remainingQty = item.quantity;
      
      const draftAllocations = sortedLocs.map(loc => {
        let takeQty = 0;
        if (remainingQty > 0) {
           takeQty = Math.min(remainingQty, loc.availableQty);
           remainingQty -= takeQty;
        }
        return {
           warehouseId: loc.warehouseId,
           warehouseName: warehouses?.find(w => w.id === loc.warehouseId)?.warehouseName || '',
           locationId: loc.locationId,
           locationCode: locations?.find(l => l.id === loc.locationId)?.locationCode || '',
           availableQty: loc.availableQty,
           allocatedQty: takeQty
        };
      });
      
      drafts.push({
        originalKey: item.key,
        productId: item.productId,
        productName: item.productName,
        requiredQty: item.quantity,
        allocations: draftAllocations
      });
    }
    
    if (!hasChanges || drafts.length === 0) {
      message.info('Các sản phẩm đã được phân bổ đủ hoặc không có tồn kho để phân bổ.');
      return;
    }
    
    setAllocationDrafts(drafts);
    setPreviewModalVisible(true);
  };

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const hasInsufficientStock = items.some((i) => i.availableStock !== null && (i.quantity > i.availableStock || i.availableStock === 0));
  const hasInvalidQuantity = items.some((i) => i.quantity <= 0);
  const allStockChecked = items.length > 0 && items.every((i) => i.availableStock !== null && !i.stockChecking);
  const canSubmit = items.length > 0 && allStockChecked && !hasInsufficientStock && !hasInvalidQuantity && items.every((i) => i.productId && i.warehouseId && i.locationId);

  const onSubmit = async () => {
    const vals = await form.validateFields();
    if (!canSubmit) {
      message.error('Vui lòng kiểm tra lại tồn kho và điền đầy đủ thông tin');
      return; 
    }

    for (const item of items) {
      try {
        const summary = await inventoryService.getByProduct(item.productId);
        const detail = summary.details.find((d) =>
          d.warehouseId === item.warehouseId && d.locationId === item.locationId
        );
        const available = detail ? (detail.availableQty ?? detail.quantity) : 0;
        if (item.quantity > available) {
          message.error(`Tồn kho đã thay đổi! SP "${item.productName}" chỉ còn ${available}. Vui lòng tải lại.`);
          setItems((prev) => prev.map((i) => i.key === item.key ? { ...i, availableStock: available } : i));
          return;
        }
      } catch {
        message.error('Không thể kiểm tra tồn kho. Vui lòng thử lại.');
        return;
      }
    }

    await createMut.mutateAsync({
      customerId: vals.customerId,
      orderDate: vals.orderDate.format('YYYY-MM-DD'),
      note: vals.note,
      items: items.map((i) => ({
        productId: i.productId,
        warehouseId: i.warehouseId,
        locationId: i.locationId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });
    message.success('Tạo đơn thành công! (Dữ liệu đã được ghi an toàn vào Master DB)');
    navigate('/sales-orders');
  };

  const itemColumns = [
    {
      title: 'Sản phẩm', key: 'product', width: 240,
      render: (_: unknown, r: LineItem) => (
        <Select placeholder="Chọn SP" value={r.productId || undefined} onChange={(v) => updateItem(r.key, 'productId', v)} style={{ width: '100%' }}
          showSearch optionFilterProp="label" options={products.map((p) => ({ label: `${p.productCode} - ${p.productName}`, value: p.id }))} />
      ),
    },
    {
      title: 'Kho', key: 'wh', width: 160,
      render: (_: unknown, r: LineItem) => {
        const validWhIds = new Set(r.stockLocations?.map(l => l.warehouseId) || []);
        const whOptions = (warehouses ?? [])
          .filter(w => validWhIds.has(w.id))
          .map(w => ({ label: `${w.warehouseName} ${w.id <= 10 ? '[📍 Shard MB]' : '[📍 Shard MN]'}`, value: w.id }));
        return (
          <Select placeholder="Chọn kho" value={r.warehouseId || undefined} onChange={(v) => updateItem(r.key, 'warehouseId', v)} style={{ width: '100%' }}
            disabled={!r.productId || r.stockChecking || whOptions.length === 0} options={whOptions} />
        );
      },
    },
    {
      title: 'Vị trí', key: 'loc', width: 160,
      render: (_: unknown, r: LineItem) => {
        const validLocIds = new Set(r.stockLocations?.filter(l => l.warehouseId === r.warehouseId).map(l => l.locationId) || []);
        const locOptions = (locations ?? [])
          .filter(l => l.warehouseId === r.warehouseId && validLocIds.has(l.id))
          .map(l => ({ label: l.locationCode, value: l.id }));
        return (
          <Select placeholder="Chọn vị trí" value={r.locationId || undefined} onChange={(v) => updateItem(r.key, 'locationId', v)} style={{ width: '100%' }}
            disabled={!r.warehouseId || r.stockChecking || locOptions.length === 0} options={locOptions} />
        );
      },
    },
    {
      title: 'Tồn khả dụng', key: 'avail', width: 120, align: 'center' as const,
      render: (_: unknown, r: LineItem) => {
        if (r.stockChecking) return <Tag style={{ borderRadius: 8 }}>Đang kiểm...</Tag>;
        if (r.availableStock === null) return <Tag color="default" style={{ borderRadius: 8 }}>—</Tag>;
        if (r.availableStock === 0) return <Tag color="red" style={{ borderRadius: 8 }}>Hết hàng</Tag>;
        if (r.availableStock < r.quantity) return <Tag color="red" style={{ borderRadius: 8 }}><WarningOutlined /> {r.availableStock}</Tag>;
        return <Tag color="green" style={{ borderRadius: 8 }}>{r.availableStock}</Tag>;
      },
    },
    {
      title: 'SL', key: 'qty', width: 90,
      render: (_: unknown, r: LineItem) => (
        <InputNumber min={1} max={r.availableStock || undefined} value={r.quantity} onChange={(v) => updateItem(r.key, 'quantity', v ?? 1)} style={{ width: '100%' }} status={r.availableStock !== null && (r.quantity > r.availableStock || r.availableStock === 0) ? 'error' : undefined} />
      ),
    },
    {
      title: 'Đơn giá', key: 'price', width: 130,
      render: (_: unknown, r: LineItem) => <InputNumber min={0} value={r.unitPrice} onChange={(v) => updateItem(r.key, 'unitPrice', v ?? 0)} style={{ width: '100%' }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />,
    },
    {
      title: 'Thành tiền', key: 'total', width: 120, align: 'right' as const,
      render: (_: unknown, r: LineItem) => <span style={{ fontWeight: 600 }}>{numeral(r.quantity * r.unitPrice).format('0,0')}</span>,
    },
    {
      title: '', key: 'act', width: 80,
      render: (_: unknown, r: LineItem) => (
        <Space>
          <Button type="text" style={{ color: '#faad14' }} icon={<ThunderboltFilled />} onClick={() => doAutoAllocate([r.key])} title="Phân bổ tự động" />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(r.key)} />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Modal
        title={<span><ThunderboltFilled style={{ color: '#faad14', marginRight: 8 }} /> Tùy chỉnh Phân bổ Tồn kho</span>}
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false);
          if (activeDraftId) {
            emitDraftCancel(activeDraftId);
            setActiveDraftId(null);
          }
          setConfirmedLocations(new Set());
        }}
        onOk={confirmAllocation}
        width={900}
        okText="Xác nhận phân bổ"
        cancelText="Hủy"
        okButtonProps={{ disabled: isConfirmDisabled }}
        maskClosable={false}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">Hệ thống đã tự động tính toán dựa trên các kho có nhiều tồn nhất. Bạn có thể tự do điều chỉnh số lượng phân bổ ở từng kho nếu muốn.</Text>
          {activeDraftId && (
            <Alert 
              type="info" 
              showIcon 
              message="Yêu cầu quét mã xác nhận" 
              description="Vui lòng dùng tính năng Quét mã trên điện thoại để quét mã QR tại từng vị trí kệ hàng được phân bổ trước khi xác nhận." 
              style={{ marginTop: 12 }} 
            />
          )}
        </div>
        
        <div style={{ maxHeight: 500, overflowY: 'auto', paddingRight: 8 }}>
          {allocationDrafts?.map((draft, dIdx) => {
            const totalAllocated = draft.allocations.reduce((s, a) => s + a.allocatedQty, 0);
            const isMissing = totalAllocated < draft.requiredQty;
            const isOver = totalAllocated > draft.requiredQty;
            
            return (
              <div key={draft.originalKey} style={{ marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Title level={5} style={{ margin: 0 }}>{draft.productName}</Title>
                  <Space>
                    <Text>Yêu cầu: <Text strong>{draft.requiredQty}</Text></Text>
                    <Text>|</Text>
                    <Text>Đã phân bổ: <Text strong style={{ color: isMissing || isOver ? '#ef4444' : '#10b981' }}>{totalAllocated}</Text></Text>
                    {isMissing && <Tag color="error" style={{ marginLeft: 8 }}>Thiếu {draft.requiredQty - totalAllocated}</Tag>}
                    {isOver && <Tag color="warning" style={{ marginLeft: 8 }}>Dư {totalAllocated - draft.requiredQty}</Tag>}
                  </Space>
                </div>
                
                <Table 
                  dataSource={draft.allocations}
                  pagination={false}
                  size="small"
                  rowKey={(r) => `${r.warehouseId}-${r.locationId}`}
                  columns={[
                     { title: 'Kho', key: 'wh', render: (_, r) => warehouses?.find(w => w.id === r.warehouseId)?.warehouseName || '-' },
                     { title: 'Vị trí', key: 'loc', render: (_, r) => {
                       const code = locations?.find(l => l.id === r.locationId)?.locationCode || '-';
                       const isConfirmed = confirmedLocations.has(code);
                       return (
                         <Space>
                           <Text>{code}</Text>
                           {!isConfirmed && r.allocatedQty > 0 && (
                             <Button type="text" size="small" icon={<QrcodeOutlined style={{ color: '#1890ff' }} />} onClick={() => setDemoLocationQrCode(code)} title="Tạo QR Demo Vị trí" />
                           )}
                           {isConfirmed && <Tag color="success" style={{ margin: 0 }}>✓ Đã quét</Tag>}
                         </Space>
                       );
                     }},
                     { title: 'Tồn khả dụng', key: 'avail', align: 'center', render: (_, r) => <Tag color={r.availableQty > 0 ? 'green' : 'red'}>{r.availableQty}</Tag> },
                     { title: 'SL Phân bổ', key: 'qty', align: 'right', render: (_, r, aIdx) => (
                        <InputNumber 
                          min={0} 
                          max={r.availableQty} 
                          value={r.allocatedQty} 
                          onChange={(val) => handleDraftChange(dIdx, aIdx, val)} 
                          style={{ width: 100 }}
                          status={r.allocatedQty > r.availableQty ? 'error' : undefined}
                        />
                     )}
                  ]}
                />

                {activeDraftId && (
                  <div style={{ marginTop: 8, textAlign: 'right' }}>
                    <Button size="small" icon={<CameraOutlined />} onClick={() => { setScanMode('location'); setScannerOpen(true); }}>
                      Quét vị trí xác nhận
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      <div className="page-header">
        <div>
          <div className="page-title">
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales-orders')} />
            <ExportOutlined style={{ color: 'var(--color-primary)' }} /> Tạo đơn xuất hàng
          </div>
          <div className="page-subtitle">Sales Order → Giữ hàng → Sau đó tạo Delivery Note để xuất kho</div>
        </div>
      </div>

      {hasInsufficientStock && (
        <Alert type="error" showIcon icon={<WarningOutlined />} message="Không đủ tồn kho" description="Một hoặc nhiều sản phẩm có số lượng yêu cầu vượt quá tồn khả dụng. Vui lòng điều chỉnh." style={{ marginBottom: 20, borderRadius: 12 }} />
      )}

      <div className="content-card" style={{ marginBottom: 20 }}>
        <Form form={form} layout="vertical" initialValues={{ orderDate: dayjs() }}>
          <Space size={24} style={{ width: '100%' }} wrap>
            <Form.Item name="customerId" label="Khách hàng" rules={[{ required: true, message: 'Chọn KH' }]} style={{ minWidth: 280 }}>
              <Select placeholder="Chọn khách hàng" showSearch optionFilterProp="label" options={customers?.filter((c) => !c.isDeleted).map((c) => ({ label: `${c.customerCode} - ${c.name}`, value: c.id })) ?? []} />
            </Form.Item>
            <Form.Item name="orderDate" label="Ngày đặt" rules={[{ required: true }]}><DatePicker format="DD/MM/YYYY" /></Form.Item>
            <Form.Item name="note" label="Ghi chú" style={{ minWidth: 300 }}><Input placeholder="Ghi chú" /></Form.Item>
          </Space>
        </Form>
      </div>

      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={5} style={{ margin: 0 }}>Chi tiết sản phẩm</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Hệ thống tự kiểm tra tồn kho khi chọn vị trí. Công thức: Khả dụng = Tổng tồn - Đã giữ</Text>
          </div>
          <Space>
            <Button icon={<QrcodeOutlined />} onClick={() => setDemoQrModalVisible(true)}>Tạo QR</Button>
            <Badge dot={connected} color="green" offset={[-4, 4]}>
              <Button icon={<CameraOutlined />} onClick={() => { setScanMode('product'); setScannerOpen(true); }}>Quét mã</Button>
            </Badge>
            <Button icon={<ThunderboltFilled style={{ color: '#faad14' }} />} onClick={() => doAutoAllocate(items.map(i => i.key))}>Tự động phân bổ</Button>
            <Button icon={<PlusOutlined />} onClick={addItem}>Thêm dòng</Button>
          </Space>
        </div>
        <Table dataSource={items} columns={itemColumns} rowKey="key" pagination={false} size="middle" scroll={{ x: 1200 }} />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary">Tổng tiền: </Text>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>{numeral(totalAmount).format('0,0')} ₫</span>
        </div>
        <div style={{ textAlign: 'right', marginTop: 20 }}>
          <Space>
            <Button onClick={() => navigate('/sales-orders')}>Hủy</Button>
            <Button type="primary" onClick={onSubmit} loading={createMut.isPending} disabled={!canSubmit} style={{ minWidth: 180 }}>
              {!allStockChecked && items.length > 0 ? 'Đang kiểm tra tồn kho...' : 'Tạo đơn xuất & Giữ hàng'}
            </Button>
          </Space>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={(scannedText) => {
          let finalCode = scannedText;
          // Extract product code if the user scanned the full URL
          if (scannedText.includes('?scan=')) {
            try {
              const url = new URL(scannedText);
              finalCode = url.searchParams.get('scan') || scannedText;
            } catch (e) {
              // Ignore invalid URL
            }
          }

          if (scanMode === 'product') {
            emitScanProduct(finalCode, 1);
          } else if (scanMode === 'location' && activeDraftId) {
            emitScanLocation(activeDraftId, finalCode);
          }
          setScannerOpen(false);
        }}
        title={scanMode === 'product' ? 'Quét mã Sản phẩm' : 'Quét mã Vị trí kệ'}
        description={scanMode === 'product' ? 'Đưa mã vạch sản phẩm vào camera để thêm vào đơn' : 'Đưa mã QR trên kệ hàng để xác nhận vị trí'}
      />

      {/* Demo QR Modal (for Lab testing) */}
      <Modal
        title="Tạo mã QR Sản phẩm"
        open={demoQrModalVisible}
        onCancel={() => setDemoQrModalVisible(false)}
        footer={null}
        width={400}
        centered
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Chọn một sản phẩm để tạo mã QR. Bạn có thể dùng điện thoại để quét mã này trực tiếp từ màn hình máy tính.
          </Text>
        </div>
        <Select
          showSearch
          style={{ width: '100%', marginBottom: 24 }}
          placeholder="Chọn sản phẩm..."
          optionFilterProp="label"
          options={products.map((p) => ({ label: `${p.productCode} - ${p.productName}`, value: p.productCode }))}
          onChange={(val) => setDemoQrProductCode(val)}
        />
        
        {demoQrProductCode && (() => {
          const isLocalhost = window.location.hostname === 'localhost';
          if (isLocalhost) {
            return (
              <Alert 
                type="error" 
                showIcon 
                message="Lỗi địa chỉ truy cập" 
                description={
                  <span>
                    Bạn đang truy cập web bằng <b>localhost</b> nên điện thoại sẽ không thể quét và kết nối được.<br/>
                    Vui lòng đổi địa chỉ trên trình duyệt máy tính thành IP mạng LAN (Ví dụ: <b>http://192.168.1.x:5173</b>) rồi tạo lại mã.
                  </span>
                } 
                style={{ marginTop: 16 }}
              />
            );
          }

          const origin = window.location.origin;
          const scanUrl = `${origin}/sales-orders/new?scan=${demoQrProductCode}&ownerId=${user?.id || ''}`;
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
              <QRCodeSVG value={scanUrl} size={250} level="H" includeMargin />
              <Text strong style={{ marginTop: 16, fontSize: 18 }}>{demoQrProductCode}</Text>
              <Text type="secondary" style={{ marginTop: 8, textAlign: 'center' }}>
                Mở <b>Camera mặc định</b> trên điện thoại và quét mã này. Nó sẽ mở trình duyệt điện thoại và tự động phân bổ!
              </Text>
              <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                (Mã đồng bộ PC: User {user?.id || 'N/A'})
              </Text>
            </div>
          );
        })()}
      </Modal>

      {/* Demo Location QR Modal */}
      <Modal
        title="Mã QR Vị trí (Demo Lab)"
        open={!!demoLocationQrCode}
        onCancel={() => setDemoLocationQrCode(null)}
        footer={null}
        width={300}
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
          <QRCodeSVG value={demoLocationQrCode || ''} size={200} level="H" includeMargin />
          <Text strong style={{ marginTop: 16, fontSize: 20, color: '#1890ff' }}>{demoLocationQrCode}</Text>
          <Text type="secondary" style={{ marginTop: 8, textAlign: 'center' }}>
            Dùng nút "Quét vị trí xác nhận" trên điện thoại để quét mã này!
          </Text>
        </div>
      </Modal>
    </div>
  );
}
