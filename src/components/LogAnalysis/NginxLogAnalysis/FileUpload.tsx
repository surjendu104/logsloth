import React, {
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import * as pako from 'pako';
import classes from './FileUpload.module.css';
import {
  LuCircleCheckBig,
  LuCloudUpload,
  LuFile,
  LuTrash,
} from 'react-icons/lu';
import ngInxIcon from '../../../assets/nginx-icon.svg';

const FileUpload = ({
  setAccessLogs,
  setErrorLogs,
}: {
  setAccessLogs: Dispatch<SetStateAction<string[]>>;
  setErrorLogs: Dispatch<SetStateAction<string[]>>;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const filesArray = Array.from(droppedFiles);
      setFiles(filesArray);
    }
  };

  const initiateFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files.length !== 0) {
      const files = Array.from(event.target.files);
      setFiles(files);
    }
  };

  const processFile = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          let logContent = '';
          if (file.name.endsWith('.gz')) {
            const content = event.target?.result;
            if (!content) throw new Error('Failed to read file');

            let compressedData: Uint8Array;
            if (content instanceof ArrayBuffer) {
              compressedData = new Uint8Array(content);
            } else {
              throw new Error('Expected ArrayBuffer');
            }
            const decompressedData = pako.inflate(compressedData);

            // Convert Uint8Array to string
            logContent = new TextDecoder().decode(decompressedData);
          } else {
            logContent = (event.target?.result as string) || '';
          }
          const logs = logContent
            .split('\n')
            .filter((line) => line.trim().length > 0);
          resolve(logs);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };

      if (file.name.endsWith('.gz')) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleFileUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setProcessingProgress(0);

    try {
      let accessLogs: string[] = [];
      let errorLogs: string[] = [];

      for (let i = 0; i < files.length; ++i) {
        const logs = await processFile(files[i]);
        if (files[i].name.includes('error')) {
          errorLogs = errorLogs.concat(logs);
        } else {
          accessLogs = accessLogs.concat(logs);
        }
        setProcessingProgress(
          parseFloat(((100 * (i + 1)) / files.length).toFixed(2)),
        );
      }
      setAccessLogs(accessLogs);
      setErrorLogs(errorLogs);
    } catch (error) {
      console.error(`File Upload failed with error : ${error}`);
      setIsUploading(true);
      setProcessingProgress(0);
    }
  };

  const removeFile = (fileIndex: number) => {
    const updatedFiles = files.filter((_, index) => index !== fileIndex);
    setFiles(updatedFiles);
  };

  return (
    <div className={classes.mainContainer}>
      <div className={classes.fileUploadContainer}>
        <div className={classes.heading}>
          <img src={ngInxIcon} className={classes.ngInxIcon} alt="" />
          <div>Nginx Log Analyzer</div>
        </div>
        <div
          className={`${classes.fileInputContainer} ${isDragging ? classes.fileDragging : ''}`}
          onClick={initiateFileInput}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className={classes.fileInput}
            ref={fileInputRef}
            accept=".log,.gz,text/plain,application/gzip,.1"
            onChange={handleFileInputChange}
            multiple
          />
          {files.length === 0 ? (
            <LuCloudUpload size={34} color="var(--text-black)" />
          ) : (
            <LuCircleCheckBig size={34} color="var(--text-black)" />
          )}

          <div className={classes.dndTextContainer}>
            {files.length === 0 ? (
              <>
                <span>Drag and Drop the log files here</span>
                <div className={classes.divider}>
                  <span>or</span>
                </div>

                <span className={classes.browseFiles}>Browse Files</span>
              </>
            ) : (
              <>
                <div className={classes.fileCount}>
                  <LuFile /> <span>{files.length} files uploaded</span>{' '}
                </div>{' '}
                <span className={classes.textSecondary}>
                  Click to re-upload
                </span>
              </>
            )}
          </div>
        </div>
        {files.length > 0 && (
          <div className={classes.fileListMainCt}>
            <div className={classes.fileCount}>
              <LuFile /> <span>{files.length} files uploaded</span>
            </div>
            <div className={classes.fileList}>
              {files.map((f, idx) => (
                <div className={classes.fileItem} key={idx}>
                  <div>
                    <span>{f.name}</span>
                    <span> ({(f.size / 1000).toFixed(2)}kb)</span>
                  </div>
                  <LuTrash
                    onClick={() => removeFile(idx)}
                    className={classes.removeIcon}
                  />
                </div>
              ))}
            </div>{' '}
            {isUploading && (
              <>
                <div className={classes.processingText}>
                  Processing Files({processingProgress}%)
                </div>
                <div className={classes.processingProgressOuter}>
                  <div
                    className={classes.processingProgressInner}
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        )}
        {files.length > 0 && (
          <button className={classes.uploadButton} onClick={handleFileUpload}>
            Proceed
          </button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
