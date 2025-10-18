import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AdvancedFakeReviewDetector, Review, FakeReviewResult } from '../services/advancedFakeReviewDetector';
import { ShopRiskAnalyzer, Shop, Report, Rating, ShopRiskResult } from '../services/shopRiskAnalyzer';
import { RealTimePhishingSystem, PhishingAlert } from '../services/realTimePhishingSystem';
import { AdvancedFakeReviewSystem } from '../services/advancedFakeReviewSystem';

interface AdvancedAIAnalysisProps {
  shop: Shop;
  reports: Report[];
  ratings: Rating[];
  shopUrl: string;
}

export const AdvancedAIAnalysis: React.FC<AdvancedAIAnalysisProps> = ({
  shop,
  reports,
  ratings,
  shopUrl
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    fakeReviews: FakeReviewResult[];
    shopRisk: ShopRiskResult | null;
    phishingAlert: PhishingAlert | null;
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);

  const fakeReviewDetector = AdvancedFakeReviewDetector.getInstance();
  const shopRiskAnalyzer = ShopRiskAnalyzer.getInstance();
  const phishingSystem = RealTimePhishingSystem.getInstance();
  const advancedSystem = AdvancedFakeReviewSystem.getInstance();

  useEffect(() => {
    // 실시간 모니터링 상태 확인
    const status = advancedSystem.getSystemStatus();
    setMonitoringEnabled(status.monitoringShops > 0);
  }, []);

  const runAdvancedAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 1. 고급 가짜 리뷰 탐지
      const fakeReviewResults = await fakeReviewDetector.detectFakeReviews(ratings);
      
      // 2. 쇼핑몰 위험도 분석
      const shopRiskResult = await shopRiskAnalyzer.analyzeShopRisk(shop, reports, ratings);
      
      // 3. 실시간 피싱 탐지
      const phishingAlert = await phishingSystem.detectPhishingRealTime(shopUrl);
      
      setAnalysisResults({
        fakeReviews: fakeReviewResults,
        shopRisk: shopRiskResult,
        phishingAlert
      });
      
      // 4. 통계 생성
      const fakeStats = fakeReviewDetector.generateStatistics(fakeReviewResults, ratings.length);
      
      if (fakeReviewResults.length > 0 || shopRiskResult.riskScore >= 70 || phishingAlert) {
        toast.success('AI 분석이 완료되었습니다. 주의가 필요한 항목이 발견되었습니다.');
      } else {
        toast.info('AI 분석이 완료되었습니다. 특별한 문제가 발견되지 않았습니다.');
      }
      
    } catch (error) {
      console.error('AI 분석 오류:', error);
      toast.error('AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleRealTimeMonitoring = () => {
    if (monitoringEnabled) {
      advancedSystem.stopRealTimeMonitoring(shop.id);
      setMonitoringEnabled(false);
      toast.info('실시간 모니터링이 중지되었습니다.');
    } else {
      advancedSystem.startRealTimeMonitoring(shop.id);
      setMonitoringEnabled(true);
      toast.success('실시간 모니터링이 시작되었습니다.');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'LOW': return '낮음';
      case 'MEDIUM': return '보통';
      case 'HIGH': return '높음';
      case 'CRITICAL': return '매우 높음';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="advanced-ai-analysis">
      {/* 헤더 섹션 */}
      <div className="analysis-header">
        <div className="header-content">
          <div className="header-text">
            <h2>AI 분석 시스템</h2>
            <p>구체적 기준 기반 신뢰도 분석</p>
          </div>
        </div>
      </div>

      {/* 컨트롤 버튼 섹션 */}
      <div className="analysis-controls">
        <button 
          className={`monitoring-button ${monitoringEnabled ? 'active' : ''}`}
          onClick={toggleRealTimeMonitoring}
        >
          <span className="button-icon">{monitoringEnabled ? '🟢' : '⚪'}</span>
          <span className="button-text">
            {monitoringEnabled ? '실시간 모니터링 중' : '실시간 모니터링 시작'}
          </span>
        </button>
        
        <button 
          className="analysis-button primary"
          onClick={runAdvancedAnalysis}
          disabled={isAnalyzing}
        >
          <span className="button-icon">{isAnalyzing ? '⏳' : '🚀'}</span>
          <span className="button-text">
            {isAnalyzing ? '분석 중...' : 'AI 분석 시작'}
          </span>
        </button>
      </div>

      {/* 분석 기준 섹션 */}
      <div className="analysis-criteria">
        <div className="criteria-header">
          <div className="criteria-icon">📋</div>
          <h3>우리만의 구체적 분석 기준</h3>
        </div>
        
        <div className="criteria-grid">
          <div className="criteria-card">
            <div className="card-header">
              <div className="card-icon">🔍</div>
              <h4>가짜 리뷰 탐지</h4>
            </div>
            <div className="card-content">
              <ul>
                <li>과도한 긍정 표현 2개 이상 사용</li>
                <li>5분 내 3개 이상 연속 리뷰</li>
                <li>90% 이상 5점 리뷰</li>
                <li>비현실적 배송/가격 표현</li>
              </ul>
            </div>
          </div>

          <div className="criteria-card">
            <div className="card-header">
              <div className="card-icon">🛡️</div>
              <h4>피싱 사이트 탐지</h4>
            </div>
            <div className="card-content">
              <ul>
                <li>유명 사이트와 85% 이상 유사한 도메인</li>
                <li>긴급성 강조 표현 3개 이상</li>
                <li>30일 이내 신규 도메인</li>
                <li>사업자 정보 2개 이상 부족</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 면책 조항 */}
      <div className="disclaimer">
        <div className="disclaimer-icon">⚠️</div>
        <div className="disclaimer-content">
          <strong>면책 조항:</strong> AI 분석 결과는 참고용이며, 최종 판단은 사용자에게 있습니다. 모든 분석은 구체적인 기준에 따라 객관적으로 수행됩니다.
        </div>
      </div>

      {/* 분석 결과 섹션 */}
      {analysisResults && (
        <div className="analysis-results">
          <div className="results-header">
            <div className="results-icon">📊</div>
            <h3>분석 결과</h3>
          </div>
          
          <div className="results-grid">
            {/* 가짜 리뷰 결과 */}
            {analysisResults.fakeReviews.length > 0 && (
              <div className="result-card fake-reviews">
                <div className="result-header">
                  <div className="result-icon">🚨</div>
                  <h4>의심스러운 리뷰</h4>
                  <div className="result-count">{analysisResults.fakeReviews.length}개</div>
                </div>
                <div className="result-content">
                  {analysisResults.fakeReviews.map((result, index) => (
                    <div key={index} className="fake-review-item">
                      <div className="review-score">
                        <span className="score-label">의심도:</span>
                        <span className={`score-value ${getRiskLevelColor(result.fakeScore >= 80 ? 'HIGH' : 'MEDIUM')}`}>
                          {result.fakeScore}점
                        </span>
                      </div>
                      <div className="review-reasons">
                        <strong>탐지 이유:</strong>
                        <ul>
                          {result.reasons.map((reason, reasonIndex) => (
                            <li key={reasonIndex}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 쇼핑몰 위험도 결과 */}
            {analysisResults.shopRisk && (
              <div className="result-card shop-risk">
                <div className="result-header">
                  <div className="result-icon">🏪</div>
                  <h4>쇼핑몰 위험도 분석</h4>
                </div>
                <div className="result-content">
                  <div className="risk-summary">
                    <div className="risk-score">
                      <span className="score-label">종합 위험도:</span>
                      <span className={`score-value ${getRiskLevelColor(analysisResults.shopRisk.riskLevel)}`}>
                        {analysisResults.shopRisk.riskScore}점 ({analysisResults.shopRisk.riskLevel})
                      </span>
                    </div>
                    <div className="risk-factors">
                      <strong>주요 위험 요소:</strong>
                      <ul>
                        {analysisResults.shopRisk.riskFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 피싱 알림 */}
            {analysisResults.phishingAlert && (
              <div className="result-card phishing-alert">
                <div className="result-header">
                  <div className="result-icon">🚨</div>
                  <h4>피싱 사이트 경고</h4>
                </div>
                <div className="result-content">
                  <div className="alert-content">
                    <div className="alert-level">
                      <span className="alert-label">위험도:</span>
                      <span className={`alert-value ${getRiskLevelColor(analysisResults.phishingAlert.riskLevel)}`}>
                        {analysisResults.phishingAlert.phishingScore}점 ({analysisResults.phishingAlert.riskLevel})
                      </span>
                    </div>
                    <div className="alert-reasons">
                      <strong>탐지 이유:</strong>
                      <ul>
                        {analysisResults.phishingAlert.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="alert-action">
                      <strong>권장 조치:</strong> {analysisResults.phishingAlert.action}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 리뷰 분석 섹션 */}
      <div className="review-analysis-section">
        <div className="section-header">
          <h3>리뷰 신뢰도 분석</h3>
          <p>AI 기반 리뷰 검증 시스템</p>
        </div>
        
        <div className="analysis-info">
          <div className="info-card">
            <div className="info-icon">📊</div>
            <div className="info-content">
              <h4>분석 방식</h4>
              <p>텍스트 패턴, 시간적 패턴, 행동 패턴을 종합적으로 분석하여 리뷰의 신뢰도를 평가합니다.</p>
            </div>
          </div>
          
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <div className="info-content">
              <h4>탐지 기준</h4>
              <p>과도한 긍정 표현, 연속 리뷰 패턴, 비현실적 내용 등을 기준으로 의심스러운 리뷰를 탐지합니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 면책 조항 */}
      <div className="disclaimer-footer">
        <p>* AI 분석 결과는 참고용이며, 모든 리뷰가 가짜라는 의미는 아닙니다.</p>
      </div>
    </div>
  );
};
