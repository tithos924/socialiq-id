"use client"

import { useState, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { saveBusinessProfile, type OnboardingActionState } from "./actions"

const GOALS = [
  { value: "grow_followers", label: "Crescer seguidores" },
  { value: "increase_engagement", label: "Aumentar engagement" },
  { value: "generate_leads", label: "Gerar leads" },
  { value: "increase_sales", label: "Aumentar vendas" },
  { value: "build_authority", label: "Construir autoridade" },
  { value: "brand_awareness", label: "Aumentar reconhecimento de marca" },
  { value: "go_viral", label: "Viralizar" },
]

const BRAND_VOICES = [
  "Profissional",
  "Amigável",
  "Premium",
  "Educativo",
  "Divertido",
  "Emocional",
  "Direto",
  "Inspirador",
]

interface FormState {
  businessName: string
  niche: string
  subNiche: string
  country: string
  city: string
  products: string
  services: string
  targetAudience: string
  goals: string[]
  brandVoice: string
}

const INITIAL_STATE: FormState = {
  businessName: "",
  niche: "",
  subNiche: "",
  country: "",
  city: "",
  products: "",
  services: "",
  targetAudience: "",
  goals: [],
  brandVoice: "",
}

const TOTAL_STEPS = 9

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-secondary"
      )}
    >
      {children}
    </button>
  )
}

const initialActionState: OnboardingActionState = {}

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormState>(INITIAL_STATE)
  const [state, formAction, pending] = useActionState(
    saveBusinessProfile,
    initialActionState
  )

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const canAdvance = (() => {
    switch (step) {
      case 0:
        return data.businessName.trim().length > 0
      default:
        return true
    }
  })()

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>
            Passo {step + 1} de {TOTAL_STEPS}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <Step title="Como se chama o teu negócio?">
          <Input
            autoFocus
            value={data.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            placeholder="Ex: Doce Sabor Pastelaria"
          />
        </Step>
      )}

      {step === 1 && (
        <Step title="Qual é o teu nicho?" subtitle="Ex: restauração, moda, imobiliário, beleza...">
          <Input
            autoFocus
            value={data.niche}
            onChange={(e) => update("niche", e.target.value)}
            placeholder="Ex: Restauração"
          />
        </Step>
      )}

      {step === 2 && (
        <Step title="E o sub-nicho?" subtitle="Opcional, mas ajuda-nos a ser mais específicos">
          <Input
            autoFocus
            value={data.subNiche}
            onChange={(e) => update("subNiche", e.target.value)}
            placeholder="Ex: Pastelaria artesanal"
          />
        </Step>
      )}

      {step === 3 && (
        <Step title="Em que país operas?">
          <Input
            autoFocus
            value={data.country}
            onChange={(e) => update("country", e.target.value)}
            placeholder="Ex: Angola"
          />
        </Step>
      )}

      {step === 4 && (
        <Step title="E em que cidade?">
          <Input
            autoFocus
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Ex: Luanda"
          />
        </Step>
      )}

      {step === 5 && (
        <Step title="O que vendes?" subtitle="Produtos e/ou serviços">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Produtos</Label>
              <Textarea
                value={data.products}
                onChange={(e) => update("products", e.target.value)}
                placeholder="Ex: Bolos personalizados, doçaria fina"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Serviços</Label>
              <Textarea
                value={data.services}
                onChange={(e) => update("services", e.target.value)}
                placeholder="Ex: Encomendas para eventos"
              />
            </div>
          </div>
        </Step>
      )}

      {step === 6 && (
        <Step title="Quem é o teu público-alvo?">
          <Textarea
            autoFocus
            value={data.targetAudience}
            onChange={(e) => update("targetAudience", e.target.value)}
            placeholder="Ex: Mulheres 25-45, classe média, Luanda"
          />
        </Step>
      )}

      {step === 7 && (
        <Step title="Quais são os teus objetivos?" subtitle="Escolhe um ou mais">
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <Chip
                key={g.value}
                selected={data.goals.includes(g.value)}
                onClick={() =>
                  update(
                    "goals",
                    data.goals.includes(g.value)
                      ? data.goals.filter((v) => v !== g.value)
                      : [...data.goals, g.value]
                  )
                }
              >
                {g.label}
              </Chip>
            ))}
          </div>
        </Step>
      )}

      {step === 8 && (
        <Step title="Qual é a voz da tua marca?" subtitle="Escolhe a que melhor te representa">
          <div className="flex flex-wrap gap-2">
            {BRAND_VOICES.map((v) => (
              <Chip
                key={v}
                selected={data.brandVoice === v}
                onClick={() => update("brandVoice", v)}
              >
                {v}
              </Chip>
            ))}
          </div>

          <form action={formAction} className="mt-8 space-y-4">
            {Object.entries(data).map(([key, value]) =>
              key === "goals" ? (
                (value as string[]).map((g) => (
                  <input key={g} type="hidden" name="goals" value={g} />
                ))
              ) : (
                <input key={key} type="hidden" name={key} value={value as string} />
              )
            )}

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <p className="text-xs text-muted-foreground">
              A ligação de redes sociais fica disponível a seguir, no
              dashboard — não bloqueia o teu progresso agora.
            </p>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={back}>
                Voltar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "A analisar..." : "Analisar o meu negócio"}
              </Button>
            </div>
          </form>
        </Step>
      )}

      {step < 8 && (
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
            Voltar
          </Button>
          <Button type="button" onClick={next} disabled={!canAdvance}>
            Continuar
          </Button>
        </div>
      )}
    </div>
  )
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
