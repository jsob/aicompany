import Link from 'next/link'
import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { PLANS, PLAN_ORDER } from '@/lib/pricing'
import { formatCents } from '@/lib/utils'
import {
  Users,
  ListChecks,
  FileCheck2,
  ShieldCheck,
  GitBranch,
  Receipt,
  ScrollText,
  Workflow,
  ArrowRight,
  Check,
  Bot,
} from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

const steps = [
  {
    icon: Users,
    title: '1 · Структура',
    text: 'Соберите цифровых сотрудников с ролями, инструкциями и подчинённостью — как настоящая оргструктура.',
  },
  {
    icon: ListChecks,
    title: '2 · Делегирование',
    text: 'Ставьте задачи с критериями приёмки и приоритетами. Сотрудник выполняет их реально.',
  },
  {
    icon: FileCheck2,
    title: '3 · Проверка',
    text: 'Каждый результат — версионируемый артефакт. Видно, кто, когда и сколько это стоило.',
  },
  {
    icon: ShieldCheck,
    title: '4 · Согласование',
    text: 'Значимые действия проходят через человека. Контроль остаётся за вами.',
  },
]

const features = [
  { icon: Bot, title: 'Цифровые сотрудники', text: 'Шаблоны ролей с системными инструкциями, KPI и личным бюджетом.' },
  { icon: Workflow, title: 'Граф задач', text: 'Канбан от backlog до done с прогрессом, статусами и подзадачами.' },
  { icon: GitBranch, title: 'Версионируемые артефакты', text: 'Результаты с версиями и статусом ревью — без потерянных черновиков.' },
  { icon: Receipt, title: 'Контроль стоимости', text: 'Каждый запуск учитывается: токены, стоимость, месячный бюджет.' },
  { icon: ScrollText, title: 'Аудит', text: 'Неизменяемый журнал событий: кто, что и когда сделал.' },
  { icon: ShieldCheck, title: 'Human-in-the-loop', text: 'Гейты согласования перед публикацией и внешними действиями.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">Как это работает</a>
            <a href="#features" className="transition-colors hover:text-foreground">Возможности</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Тарифы</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Войти</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Начать</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-60" />
        <div className="hero-gradient relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Операционная система цифровой компании
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
            AI-агентам нужна{' '}
            <span className="bg-gradient-to-r from-[#25D9F2] to-[#4F7DFF] bg-clip-text text-transparent">
              структура команды
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            NEXORA — центр управления вашей цифровой командой. Роли, задачи, результаты и
            человеческое согласование — в одном прозрачном пространстве.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Создать цифровую компанию <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Посмотреть демо</Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Бесплатный тариф · без карты · 3 цифровых сотрудника</p>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">Десять агентов — это ещё не команда</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Десять чатов, нуль ответственности. Кто отвечает за результат, контролирует передачу задач,
            проверяет материалы и согласует внешние действия? NEXORA даёт цифровым сотрудникам ту же
            структуру, что и живой организации.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">Четыре шага процесса</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.title} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Всё для управления цифровой командой</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-background p-6">
                <f.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">Простые тарифы</h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          Начните бесплатно. Обновляйтесь, когда команда растёт.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-4">
          {PLAN_ORDER.map((tier) => {
            const p = PLANS[tier]
            const featured = tier === 'FOUNDER'
            return (
              <div
                key={tier}
                className={
                  'flex flex-col rounded-xl border p-6 ' +
                  (featured ? 'border-accent orbit-glow bg-card' : 'border-border bg-card')
                }
              >
                {featured && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                    Популярный
                  </span>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-semibold">{formatCents(p.priceCents)}</span>
                  <span className="text-sm text-muted-foreground">/мес</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      <span className="text-muted-foreground">{h}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-6 block">
                  <Button className="w-full" variant={featured ? 'default' : 'outline'}>
                    {tier === 'FREE' ? 'Начать бесплатно' : 'Выбрать'}
                  </Button>
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Honest limitations */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="text-xl font-semibold">Честно о текущей версии</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Цифровые сотрудники реально выполняют задачи через языковые модели и создают артефакты.</li>
            <li>• Интеграции представлены как каталог подключений; реальные OAuth-подключения добавляются позже.</li>
            <li>• Биллинг — внутреннее управление тарифами и бюджетами (без реальных списаний).</li>
            <li>• Мы не заявляем автономность, клиентские результаты или сертификацию безопасности, пока они не подтверждены.</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-3xl font-semibold sm:text-4xl">Постройте свою цифровую компанию</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Создайте первого цифрового сотрудника и запустите первую задачу за несколько минут.
        </p>
        <Link href="/signup" className="mt-8 inline-block">
          <Button size="lg" className="gap-2">
            Начать бесплатно <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {CURRENT_YEAR} NEXORA · Операционная система цифровой компании
          </p>
        </div>
      </footer>
    </div>
  )
}
