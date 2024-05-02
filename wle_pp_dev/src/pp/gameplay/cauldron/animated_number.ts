import { Timer } from "wle-pp/cauldron/cauldron/timer.js";
import { EasingFunction, MathUtils } from "wle-pp/cauldron/utils/math_utils.js";

export class AnimatedNumberParams {
    public myInitialValue: number = 0;

    public myAnimationSeconds: number = 0;
    public myAnimationEasingFunction: EasingFunction = EasingFunction.easeInOut;

    /** 
     * If this value is not `null` it will be used as reference for the `myAnimationSeconds` time, which  
     * will then be considered as the time to reach `myReferenceTargetValue` from `myInitialValue`
     * 
     * This means that when a new target value is specified, the time to reach it will automatically be computed  
     * based on this value, while if this value is `null` it will always take the same time (specified with `myAnimationSeconds`)  
     * no matter how far or close the target value is from the current value
    */
    public myReferenceTargetValue: number | null = null;

    /**
     * When a new target is specified, normally the animation is restarted  
     * If this value is set to `true` it will instead keep the same percentage
     * 
     * This means that, if the animation is at 90% and you set a new target value, to reach that target value  
     * you only have to do 10% of the animation time required to reach it
     * 
     * This can make the value reach the target very fast even if the values are very far (imagine the scenario where the target is updated at 99%)  
     * but has the advantage of keeping the smoothness of the transition since the animation curve (defined by the easing) is preserved till the end
     */
    public myKeepAnimationPercentageOnNewTarget: boolean = false;

    /** `Math.round` / `Math.floor` / `Math.ceil` can be used */
    public myRoundingFunction: ((valueToRound: number) => number) | null = null;
}

export class AnimatedNumber {
    private readonly _myParams: Readonly<AnimatedNumberParams>;

    private _myCurrentValue: number = 0;
    private _myStartValue: number = 0;
    private _myTargetValue: number = 0;

    private _myAnimationTimer: Timer = new Timer(0, false);

    constructor(params: Readonly<AnimatedNumberParams>) {
        this._myParams = params;

        this._myCurrentValue = this._myParams.myInitialValue;
        this._myStartValue = this._myParams.myInitialValue;
        this._myTargetValue = this._myParams.myInitialValue;

        this._myAnimationTimer.reset(this._myParams.myAnimationSeconds);
    }

    public update(dt: number): void {
        if (this._myAnimationTimer.isRunning()) {
            this._myAnimationTimer.update(dt);

            const animationPercentage = this._myAnimationTimer.getPercentage();
            this._myCurrentValue = MathUtils.interpolate(this._myStartValue, this._myTargetValue, animationPercentage, this._myParams.myAnimationEasingFunction);
        }
    }

    public getCurrentValue(): number {
        return this._myCurrentValue;
    }

    public setTargetValue(targetValue: number): void {
        this._myTargetValue = targetValue;

        if (this._myParams.myReferenceTargetValue == null) {
            this._myStartValue = this._myCurrentValue;

            if (!this._myAnimationTimer.isRunning() || !this._myParams.myKeepAnimationPercentageOnNewTarget) {
                this._myAnimationTimer.start();
            }
        } else {
            const distanceFromInitialToReference = Math.abs(this._myParams.myReferenceTargetValue - this._myParams.myInitialValue);
            const distanceFromCurrentToTarget = Math.abs(this._myTargetValue - this._myCurrentValue);

            const secondsToReachTarget = (distanceFromCurrentToTarget / distanceFromInitialToReference) * this._myParams.myAnimationSeconds;

            this._myStartValue = this._myCurrentValue;

            if (!this._myAnimationTimer.isRunning() || !this._myParams.myKeepAnimationPercentageOnNewTarget) {
                this._myAnimationTimer.start(secondsToReachTarget);
            } else {
                const currentPercentage = this._myAnimationTimer.getPercentage();
                this._myAnimationTimer.start(secondsToReachTarget);
                this._myAnimationTimer.setPercentage(currentPercentage);
            }
        }
    }

    public isDone(): boolean {
        return this._myAnimationTimer.isDone();
    }
}