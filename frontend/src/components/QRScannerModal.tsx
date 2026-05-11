import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Input, Space, Typography, Alert } from 'antd';
import { CameraOutlined, SwapOutlined, EditOutlined } from '@ant-design/icons';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

const { Text } = Typography;

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  description?: string;
}

/**
 * QR/Barcode Scanner Modal.
 * Uses html5-qrcode to access device camera and scan codes.
 * Falls back to manual text input for testing/demo purposes.
 */
export default function QRScannerModal({
  open,
  onClose,
  onScan,
  title = 'Quét mã QR / Barcode',
  description = 'Đưa mã vạch hoặc mã QR vào vùng camera để quét',
}: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<string>('qr-reader-' + Math.random().toString(36).substr(2, 9));
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!open || manualMode) return;

    let html5QrCode: Html5Qrcode | null = null;
    let mounted = true;

    const startScanner = async () => {
      try {
        // Small delay to ensure the DOM element is rendered
        await new Promise((r) => setTimeout(r, 300));

        if (!mounted) return;

        html5QrCode = new Html5Qrcode(containerRef.current);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Success - stop scanner and return result
            onScan(decodedText);
            stopScanner(html5QrCode);
            onClose();
          },
          () => {
            // QR code scan failure - ignore (continuous scanning)
          },
        );

        setCameraError(null);
      } catch (err: any) {
        console.error('Camera error:', err);
        if (mounted) {
          setCameraError(
            err.message?.includes('NotAllowedError') || err.message?.includes('Permission')
              ? 'Camera bị từ chối. Vui lòng cấp quyền truy cập camera trong cài đặt trình duyệt.'
              : 'Không thể mở camera. Hãy thử chế độ nhập tay.',
          );
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner(html5QrCode);
    };
  }, [open, manualMode, facingMode]);

  const stopScanner = async (scanner: Html5Qrcode | null) => {
    try {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
    } catch {
      // Ignore stop errors
    }
  };

  const handleClose = async () => {
    await stopScanner(scannerRef.current);
    scannerRef.current = null;
    setCameraError(null);
    setManualMode(false);
    setManualCode('');
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      handleClose();
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <Modal
      title={
        <span>
          <CameraOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {title}
        </span>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
      destroyOnClose
      centered
    >
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary">{description}</Text>
      </div>

      {!manualMode ? (
        <>
          {/* Camera view */}
          <div
            id={containerRef.current}
            style={{
              width: '100%',
              minHeight: 300,
              borderRadius: 12,
              overflow: 'hidden',
              background: '#000',
              marginBottom: 16,
            }}
          />

          {cameraError && (
            <Alert
              type="warning"
              message={cameraError}
              showIcon
              style={{ marginBottom: 12 }}
              action={
                <Button size="small" onClick={() => setManualMode(true)}>
                  Nhập tay
                </Button>
              }
            />
          )}

          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Button icon={<SwapOutlined />} onClick={toggleCamera}>
              Đổi camera
            </Button>
            <Button icon={<EditOutlined />} onClick={() => setManualMode(true)}>
              Nhập mã bằng tay
            </Button>
          </Space>
        </>
      ) : (
        <>
          {/* Manual input mode */}
          <div style={{ padding: '20px 0' }}>
            <Text style={{ display: 'block', marginBottom: 12 }}>
              Nhập mã sản phẩm hoặc mã vị trí kho:
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="VD: PROD001 hoặc A-01-01"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onPressEnter={handleManualSubmit}
                autoFocus
                size="large"
              />
              <Button type="primary" size="large" onClick={handleManualSubmit}>
                Xác nhận
              </Button>
            </Space.Compact>
          </div>

          <Button
            icon={<CameraOutlined />}
            onClick={() => {
              setManualMode(false);
              setCameraError(null);
            }}
            style={{ width: '100%' }}
          >
            Quay lại dùng Camera
          </Button>
        </>
      )}
    </Modal>
  );
}
