import { useEffect, useState, type ReactNode } from "react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import type { Proyecto } from "../../lib/proyecto/tipos";
import { bloquesMemoria, memoriaCte, nombreArchivo, nombreArchivoMemoria, type BloqueMemoria } from "../../lib/obra/memoria";
import { anejoInstalaciones, bloquesAnejoInstalaciones } from "../../lib/obra/anejoInstalaciones";
import { bloquesEstudioBasico, estudioBasico, META_ESTUDIO_BASICO, nombreArchivoEstudioBasico } from "../../lib/obra/estudioBasico";
import type { MetaDocumento } from "../../lib/docx/render";
import { descargarBlob, descargarUrl } from "../../lib/export/descargar";
import { firmantesDe, membreteDe, type Estudio } from "../../lib/estudio/estudio";
import { useEstudio } from "../../lib/estudio/useEstudio";
import type { PdfResult } from "../../lib/pdf/utils";
import { PdfPreviewModal } from "../ui/PdfPreviewModal";
import { showToast } from "../ui/Toast";

// =============================================================================
// Exportar la memoria CTE (feature-16 §D y §E) y el anejo de instalaciones
// (feature-33), y el estudio básico de seguridad y salud (feature-35): Word y PDF, con las librerías cargadas bajo demanda (ni `docx`
// ni jsPDF entran en el bundle de La obra). Los dos son bloques de memoria y
// se pintan igual. El PDF se abre en la previsualización, como el anejo de
// fichas; el Word se descarga. Lo usan La obra y las páginas de cada documento.
// =============================================================================

export interface ExportarMemoria {
  word: () => void;
  pdf: () => void;
  ocupado: "word" | "pdf" | null;
  /** La previsualización del PDF, para montarla donde se use el hook. */
  modal: ReactNode;
}

/** Un documento del proyecto hecho de bloques de memoria. */
interface DocumentoExportable {
  /** «la memoria», para los avisos. */
  nombre: string;
  /** El estudio pone los firmantes del documento que los lleva (el estudio básico). */
  bloques: (p: Proyecto, estudio: Estudio) => BloqueMemoria[];
  archivo: (proyecto: string, ext: "pdf" | "docx") => string;
  /** Las propiedades del Word; sin decir, las de la memoria. */
  meta?: MetaDocumento;
}

const MEMORIA: DocumentoExportable = {
  nombre: "la memoria",
  bloques: (p) => bloquesMemoria(memoriaCte(p)),
  archivo: nombreArchivoMemoria,
};

const ANEJO_INSTALACIONES: DocumentoExportable = {
  nombre: "el anejo de instalaciones",
  bloques: (p) => bloquesAnejoInstalaciones(anejoInstalaciones(p)),
  archivo: (proyecto, ext) => nombreArchivo("anejo-instalaciones", proyecto, ext),
  meta: {
    asunto: "Anejo de instalaciones del edificio",
    descripcion: "Cálculo de las instalaciones del edificio redactado a partir del cálculo con Concreta Memorias",
  },
};

const ESTUDIO_BASICO: DocumentoExportable = {
  nombre: "el estudio básico de seguridad y salud",
  bloques: (p, estudio) => bloquesEstudioBasico(estudioBasico(p, { firmantes: firmantesDe(estudio, p) })),
  archivo: nombreArchivoEstudioBasico,
  meta: META_ESTUDIO_BASICO,
};

function useExportarDocumento(d: DocumentoExportable): ExportarMemoria {
  const { proyecto } = useProyecto();
  const [estudio] = useEstudio();
  const [ocupado, setOcupado] = useState<"word" | "pdf" | null>(null);
  const [pdf, setPdf] = useState<PdfResult | null>(null);

  // Revoca el blob al desmontar o al sustituirlo.
  useEffect(() => {
    return () => {
      if (pdf) URL.revokeObjectURL(pdf.blobUrl);
    };
  }, [pdf]);

  const word = async () => {
    setOcupado("word");
    try {
      const { memoriaDocx } = await import("../../lib/docx/render");
      const blob = await memoriaDocx(d.bloques(proyecto, estudio), membreteDe(estudio, proyecto), d.meta);
      descargarBlob(blob, d.archivo(proyecto.nombre, "docx"));
    } catch {
      showToast(`No se pudo generar el Word de ${d.nombre}`, { autoDismiss: 4000 });
    } finally {
      setOcupado(null);
    }
  };

  const abrirPdf = async () => {
    setOcupado("pdf");
    try {
      const { renderMemoriaPdf } = await import("../../lib/pdf/memoria");
      setPdf(renderMemoriaPdf(d.bloques(proyecto, estudio), membreteDe(estudio, proyecto), d.archivo(proyecto.nombre, "pdf")));
    } catch {
      showToast(`No se pudo generar el PDF de ${d.nombre}`, { autoDismiss: 4000 });
    } finally {
      setOcupado(null);
    }
  };

  const modal = pdf ? (
    <PdfPreviewModal
      blobUrl={pdf.blobUrl}
      filename={pdf.filename}
      pageCount={pdf.pageCount}
      onDownload={() => descargarUrl(pdf.blobUrl, pdf.filename)}
      onClose={() => setPdf(null)}
    />
  ) : null;

  return { word: () => void word(), pdf: () => void abrirPdf(), ocupado, modal };
}

export function useExportarMemoria(): ExportarMemoria {
  return useExportarDocumento(MEMORIA);
}

export function useExportarAnejoInstalaciones(): ExportarMemoria {
  return useExportarDocumento(ANEJO_INSTALACIONES);
}

export function useExportarEstudioBasico(): ExportarMemoria {
  return useExportarDocumento(ESTUDIO_BASICO);
}
