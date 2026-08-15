import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bell,
  Briefcase,
  CalendarBlank,
  CaretDown,
  Check,
  CheckCircle,
  Eye,
  EyeSlash,
  ListBullets,
  MagnifyingGlass,
  Minus,
  PencilSimple,
  Plus,
  ShareNetwork,
  SignOut,
  Sun,
  Tag,
  TrashSimple,
  UsersThree,
  X,
} from "@phosphor-icons/react";

// Nomes do dominio de um lado, biblioteca do outro: trocar de pacote mexe so aqui.
const GLIFOS = {
  sol: Sun,
  calendario: CalendarBlank,
  lista: ListBullets,
  pessoas: UsersThree,
  concluido: CheckCircle,
  etiqueta: Tag,
  maleta: Briefcase,
  mais: Plus,
  busca: MagnifyingGlass,
  sino: Bell,
  seta_baixo: CaretDown,
  sobe: ArrowUp,
  desce: ArrowDown,
  traco: Minus,
  lapis: PencilSimple,
  lixeira: TrashSimple,
  olho: Eye,
  "olho-fechado": EyeSlash,
  check: Check,
  esquerda: ArrowLeft,
  direita: ArrowRight,
  fechar: X,
  sair: SignOut,
  compartilhar: ShareNetwork,
};

export default function Icon({ name, size = 18, weight = "bold" }) {
  const Glifo = GLIFOS[name];
  return Glifo ? <Glifo size={size} weight={weight} /> : null;
}
